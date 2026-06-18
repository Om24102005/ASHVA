import UIKit
import Capacitor

// Adopts the UIScene lifecycle (required by upcoming iOS releases). The window
// and root CAPBridgeViewController are built automatically from Main.storyboard
// (UISceneStoryboardFile in Info.plist), so no manual window setup is needed.
// We only forward URL opens and user activities to Capacitor so Google Sign-In
// redirects and Universal Links keep working under the scene lifecycle.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: url, options: [:])
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity) { _ in }
    }
}
