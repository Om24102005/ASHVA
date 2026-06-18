/** KYC — upload documents to MinIO, persist record + metadata, expose status. */
import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { z } from 'zod';
import { query } from '../db.js';
import { asyncHandler, bad } from '../http.js';
import { requireAuth } from '../auth/middleware.js';
import { uploadObject } from '../providers/storage.js';

export const kycRouter = Router();
kycRouter.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

async function loadRecord(userId: string): Promise<unknown> {
  const { rows } = await query(
    `SELECT k.*, COALESCE(
        (SELECT json_agg(json_build_object('id',d.id,'pageLabel',d.page_label,'storageUrl',d.storage_url,
                                            'mimeType',d.mime_type,'byteSize',d.byte_size))
           FROM kyc_documents d WHERE d.kyc_id = k.id), '[]'::json) AS documents
       FROM kyc_records k WHERE k.user_id = $1 ORDER BY k.submitted_at DESC LIMIT 1`,
    [userId],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    docType: r.doc_type,
    idNumber: r.id_number,
    fullName: r.full_name,
    status: r.status,
    reviewNotes: r.review_notes,
    submittedAt: new Date(r.submitted_at).toISOString(),
    reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toISOString() : null,
    documents: r.documents,
  };
}

kycRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ record: await loadRecord(req.auth!.sub) });
  }),
);

kycRouter.post(
  '/submit',
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const { docType, idNumber, fullName } = z
      .object({
        docType: z.enum(['aadhaar', 'pan', 'passport', 'driving_licence', 'voter_id']),
        idNumber: z.string().min(3),
        fullName: z.string().optional().default(''),
      })
      .parse(req.body);

    const userId = req.auth!.sub;
    const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>;
    const pages = ['front', 'back', 'selfie'] as const;
    const present = pages.filter((p) => files[p]?.[0]);
    if (present.length === 0) throw bad('Attach at least one document image.');

    const ins = await query(
      `INSERT INTO kyc_records (user_id, doc_type, id_number, full_name, status, submitted_at)
       VALUES ($1,$2,$3,$4,'in_review',now())
       ON CONFLICT (user_id, doc_type)
       DO UPDATE SET id_number = EXCLUDED.id_number, full_name = EXCLUDED.full_name,
                     status = 'in_review', submitted_at = now(), reviewed_at = NULL
       RETURNING id`,
      [userId, docType, idNumber.trim(), fullName.trim() || null],
    );
    const kycId = ins.rows[0]!.id as string;
    await query('DELETE FROM kyc_documents WHERE kyc_id = $1', [kycId]);

    for (const page of present) {
      const f = files[page]![0]!;
      const key = `${userId}/${kycId}/${page}-${crypto.randomUUID()}`;
      const url = await uploadObject(key, f.buffer, f.mimetype || 'image/jpeg');
      await query(
        `INSERT INTO kyc_documents (kyc_id, page_label, storage_url, mime_type, byte_size) VALUES ($1,$2,$3,$4,$5)`,
        [kycId, page, url, f.mimetype || 'image/jpeg', f.size],
      );
    }
    res.json({ record: await loadRecord(userId) });
  }),
);
