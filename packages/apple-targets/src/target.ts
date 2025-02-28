import { PBXNativeTarget, XcodeProject } from "@bacons/xcode";
import plist from "@expo/plist";

export type ExtensionType =
  | "widget"
  | "notification-content"
  | "notification-service"
  | "share"
  | "intent"
  | "bg-download"
  | "intent-ui"
  | "spotlight"
  | "matter"
  | "quicklook-thumbnail"
  | "imessage"
  | "clip"
  | "clip-widget"
  | "watch"
  | "location-push"
  | "credentials-provider"
  | "account-auth"
  | "action"
  | "safari"
  | "app-intent"
  | "device-activity-monitor";

export const KNOWN_EXTENSION_POINT_IDENTIFIERS: Record<string, ExtensionType> =
  {
    "com.apple.message-payload-provider": "imessage",
    "com.apple.widgetkit-extension": "widget",
    "com.apple.usernotifications.content-extension": "notification-content",
    "com.apple.share-services": "share",
    "com.apple.usernotifications.service": "notification-service",
    "com.apple.spotlight.import": "spotlight",
    "com.apple.intents-service": "intent",
    "com.apple.intents-ui-service": "intent-ui",
    "com.apple.Safari.web-extension": "safari",
    "com.apple.background-asset-downloader-extension": "bg-download",
    "com.apple.matter.support.extension.device-setup": "matter",
    "com.apple.quicklook.thumbnail": "quicklook-thumbnail",
    "com.apple.location.push.service": "location-push",
    "com.apple.authentication-services-credential-provider-ui":
      "credentials-provider",
    "com.apple.authentication-services-account-authentication-modification-ui":
      "account-auth",
    "com.apple.services": "action",
    "com.apple.appintents-extension": "app-intent",
    "com.apple.deviceactivity.monitor-extension": "device-activity-monitor",
    // "com.apple.intents-service": "intents",
  };

// An exhaustive list of extension types that should sync app groups from the main target by default when
// no app groups are specified.
export const SHOULD_USE_APP_GROUPS_BY_DEFAULT: Record<ExtensionType, boolean> =
  {
    share: true,
    "bg-download": true,
    clip: true,
    "clip-widget": true,
    widget: true,
    "account-auth": false,
    "credentials-provider": false,
    "device-activity-monitor": false,
    "app-intent": false,
    "intent-ui": false,
    "location-push": false,
    "notification-content": false,
    "notification-service": false,
    "quicklook-thumbnail": false,
    action: false,
    imessage: false,
    intent: false,
    matter: false,
    safari: false,
    spotlight: false,
    watch: false,
  };

// TODO: Maybe we can replace `NSExtensionPrincipalClass` with the `@main` annotation that newer extensions use?
export function getTargetInfoPlistForType(type: ExtensionType) {
  // TODO: Use exhaustive switch to ensure external contributors don't forget to add this.
  if (type === "watch") {
    return plist.build({});
  } else if (type === "action") {
    return plist.build({
      NSExtension: {
        NSExtensionAttributes: {
          NSExtensionActivationRule: {
            NSExtensionActivationSupportsFileWithMaxCount: 0,
            NSExtensionActivationSupportsImageWithMaxCount: 0,
            NSExtensionActivationSupportsMovieWithMaxCount: 0,
            NSExtensionActivationSupportsText: false,
            NSExtensionActivationSupportsWebURLWithMaxCount: 1,
          },
          NSExtensionJavaScriptPreprocessingFile: "assets/index",
          NSExtensionServiceAllowsFinderPreviewItem: true,
          NSExtensionServiceAllowsTouchBarItem: true,
          NSExtensionServiceFinderPreviewIconName: "NSActionTemplate",
          NSExtensionServiceTouchBarBezelColorName: "TouchBarBezel",
          NSExtensionServiceTouchBarIconName: "NSActionTemplate",
        },
        NSExtensionPointIdentifier: "com.apple.services",
        NSExtensionPrincipalClass:
          "$(PRODUCT_MODULE_NAME).ActionRequestHandler",
      },
    });
  } else if (type === "app-intent") {
    return plist.build({
      EXAppExtensionAttributes: {
        EXExtensionPointIdentifier: "com.apple.appintents-extension",
      },
    });
  } else if (type === "clip") {
    return plist.build({
      CFBundleName: "$(PRODUCT_NAME)",
      CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
      CFBundleVersion: "$(CURRENT_PROJECT_VERSION)",
      CFBundleExecutable: "$(EXECUTABLE_NAME)",
      CFBundlePackageType: "$(PRODUCT_BUNDLE_PACKAGE_TYPE)",
      CFBundleShortVersionString: "$(MARKETING_VERSION)",
      UIApplicationSupportsIndirectInputEvents: true,
      NSAppClip: {
        NSAppClipRequestEphemeralUserNotification: false,
        NSAppClipRequestLocationConfirmation: false,
      },
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSAllowsLocalNetworking: true,
      },
      UILaunchStoryboardName: "SplashScreen",
      UIUserInterfaceStyle: "Automatic",
      UIViewControllerBasedStatusBarAppearance: false,
    });
  }
  const NSExtensionPointIdentifier = Object.keys(
    KNOWN_EXTENSION_POINT_IDENTIFIERS
  ).find((key) => KNOWN_EXTENSION_POINT_IDENTIFIERS[key] === type);

  if (type === "imessage") {
    return plist.build({
      NSExtension: {
        NSExtensionPointIdentifier,
        // This is hardcoded as there is no Swift code in the imessage extension.
        NSExtensionPrincipalClass: "StickerBrowserViewController",
      },
    });
  } else if (type === "account-auth") {
    return plist.build({
      NSExtension: {
        NSExtensionPointIdentifier,

        NSExtensionPrincipalClass:
          "$(PRODUCT_MODULE_NAME).AccountAuthViewController",

        NSExtensionAttributes: {
          ASAccountAuthenticationModificationSupportsStrongPasswordChange: true,
          ASAccountAuthenticationModificationSupportsUpgradeToSignInWithApple:
            true,
        },
      },
    });
  } else if (type === "credentials-provider") {
    return plist.build({
      NSExtension: {
        NSExtensionPointIdentifier,
        NSExtensionPrincipalClass:
          "$(PRODUCT_MODULE_NAME).CredentialProviderViewController",
      },
    });
  } else if (type === "notification-service") {
    return plist.build({
      NSExtension: {
        NSExtensionAttributes: {
          NSExtensionActivationRule: "TRUEPREDICATE",
        },
        // TODO: Update `NotificationService` dynamically
        NSExtensionPrincipalClass: "$(PRODUCT_MODULE_NAME).NotificationService",
        // NSExtensionMainStoryboard: 'MainInterface',
        NSExtensionPointIdentifier,
      },
    });
  } else if (type === "quicklook-thumbnail") {
    return plist.build({
      NSExtension: {
        NSExtensionAttributes: {
          QLSupportedContentTypes: [],
          QLThumbnailMinimumDimension: 0,
        },
        NSExtensionPrincipalClass: "$(PRODUCT_MODULE_NAME).ThumbnailProvider",
        NSExtensionPointIdentifier,
      },
    });
  } else if (type === "spotlight") {
    return plist.build({
      CSExtensionLabel: "myImporter",
      NSExtension: {
        NSExtensionAttributes: {
          CSSupportedContentTypes: ["com.example.plain-text"],
        },
        // TODO: Update `ImportExtension` dynamically
        NSExtensionPrincipalClass: "$(PRODUCT_MODULE_NAME).ImportExtension",
        // NSExtensionMainStoryboard: 'MainInterface',
        NSExtensionPointIdentifier,
      },
    });
  } else if (type === "share") {
    return plist.build({
      NSExtension: {
        NSExtensionAttributes: {
          NSExtensionActivationRule: "TRUEPREDICATE",
        },
        // TODO: Update `ShareViewController` dynamically
        NSExtensionPrincipalClass: "$(PRODUCT_MODULE_NAME).ShareViewController",
        // NSExtensionMainStoryboard: 'MainInterface',
        NSExtensionPointIdentifier,
      },
    });
  } else if (type === "intent-ui") {
    return plist.build({
      NSExtension: {
        NSExtensionAttributes: {
          IntentsSupported: ["INSendMessageIntent"],
        },
        // TODO: Update `IntentViewController` dynamically
        NSExtensionPrincipalClass:
          "$(PRODUCT_MODULE_NAME).IntentViewController",
        NSExtensionPointIdentifier,
      },
    });
  } else if (type === "intent") {
    return plist.build({
      NSExtension: {
        NSExtensionAttributes: {
          IntentsRestrictedWhileLocked: [],
          IntentsSupported: [
            "INSendMessageIntent",
            "INSearchForMessagesIntent",
            "INSetMessageAttributeIntent",
          ],
        },
        // TODO: Update `IntentHandler` dynamically
        NSExtensionPrincipalClass: "$(PRODUCT_MODULE_NAME).IntentHandler",
        NSExtensionPointIdentifier,
      },
    });
  } else if (type === "matter") {
    return plist.build({
      NSExtension: {
        NSExtensionPrincipalClass: "$(PRODUCT_MODULE_NAME).RequestHandler",
        NSExtensionPointIdentifier,
      },
    });
  } else if (type === "location-push") {
    return plist.build({
      NSExtension: {
        NSExtensionPrincipalClass: "$(PRODUCT_MODULE_NAME).LocationPushService",
        NSExtensionPointIdentifier,
      },
    });
  } else if (type === "safari") {
    return plist.build({
      NSExtension: {
        // TODO: Update `SafariWebExtensionHandler` dynamically
        NSExtensionPrincipalClass:
          "$(PRODUCT_MODULE_NAME).SafariWebExtensionHandler",
        // NSExtensionMainStoryboard: 'MainInterface',
        NSExtensionPointIdentifier,
      },
    });
  } else if (type === "notification-content") {
    return plist.build({
      NSExtension: {
        NSExtensionAttributes: {
          UNNotificationExtensionCategory: "myNotificationCategory",
          UNNotificationExtensionInitialContentSizeRatio: 1,
        },
        // TODO: Update `NotificationViewController` dynamically
        NSExtensionPrincipalClass:
          "$(PRODUCT_MODULE_NAME).NotificationViewController",
        // NSExtensionMainStoryboard: 'MainInterface',
        NSExtensionPointIdentifier,
      },
    });
  }

  // Default: used for widget and bg-download
  return plist.build({
    NSExtension: {
      NSExtensionPointIdentifier,
    },
  });
}

export function productTypeForType(type: ExtensionType) {
  switch (type) {
    case "clip":
      return "com.apple.product-type.application.on-demand-install-capable";
    case "watch":
      return "com.apple.product-type.application";
    case "app-intent":
      return "com.apple.product-type.extensionkit-extension";
    default:
      return "com.apple.product-type.app-extension";
  }
}

export function needsEmbeddedSwift(type: ExtensionType) {
  return [
    "watch",
    "spotlight",
    "share",
    "intent",
    "intent-ui",
    "bg-download",
    "quicklook-thumbnail",
    "matter",
    "clip",
  ].includes(type);
}

export function getFrameworksForType(type: ExtensionType) {
  if (type === "widget" || type === "clip-widget") {
    return [
      // CD07060B2A2EBE2E009C1192 /* WidgetKit.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = WidgetKit.framework; path = System/Library/Frameworks/WidgetKit.framework; sourceTree = SDKROOT; };
      "WidgetKit",
      // CD07060D2A2EBE2E009C1192 /* SwiftUI.framework */ = {isa = PBXFileReference; lastKnownFileType = wrapper.framework; name = SwiftUI.framework; path = System/Library/Frameworks/SwiftUI.framework; sourceTree = SDKROOT; };
      "SwiftUI",
      "ActivityKit",
      "AppIntents",
    ];
  } else if (type === "intent") {
    return ["Intents"];
  } else if (type === "intent-ui") {
    return ["IntentsUI"];
  } else if (type === "quicklook-thumbnail") {
    return ["QuickLookThumbnailing"];
  } else if (type === "notification-content") {
    return ["UserNotifications", "UserNotificationsUI"];
  } else if (type === "app-intent") {
    return ["AppIntents"];
  } else if (type === "device-activity-monitor") {
    return ["DeviceActivity"];
  } else if (type === "action") {
    return [
      // "UniformTypeIdentifiers"
    ];
  }

  return [];
}

export function isNativeTargetOfType(
  target: PBXNativeTarget,
  type: ExtensionType
): boolean {
  if (
    type === "watch" &&
    target.props.productType === "com.apple.product-type.application"
  ) {
    return (
      "WATCHOS_DEPLOYMENT_TARGET" in
      target.getDefaultConfiguration().props.buildSettings
    );
  }
  if (
    type === "clip" &&
    target.props.productType ===
      "com.apple.product-type.application.on-demand-install-capable"
  ) {
    return true;
  }
  if (target.props.productType !== "com.apple.product-type.app-extension") {
    return false;
  }
  // Could be a Today Extension, Share Extension, etc.

  const infoPlist = target.getDefaultConfiguration().getInfoPlist();

  if (!infoPlist.NSExtension?.NSExtensionPointIdentifier) {
    console.error(
      "No NSExtensionPointIdentifier found in extension Info.plist for target: " +
        target.getDisplayName()
    );
    return false;
  }

  return (
    KNOWN_EXTENSION_POINT_IDENTIFIERS[
      infoPlist.NSExtension?.NSExtensionPointIdentifier
    ] === type
  );
}

export function getMainAppTarget(project: XcodeProject): PBXNativeTarget {
  const target = project.rootObject.getMainAppTarget("ios");
  if (!target) {
    throw new Error("No main app target found");
  }
  return target;
}

export function getAuxiliaryTargets(project: XcodeProject): PBXNativeTarget[] {
  const mainTarget = project.rootObject.getMainAppTarget("ios");
  return project.rootObject.props.targets.filter((target) => {
    return target.uuid !== mainTarget?.uuid;
  }) as PBXNativeTarget[];
}

export function getTargetFromBundleId(project: XcodeProject, bundleId: string): PBXNativeTarget | undefined {
  return project.rootObject.props.targets.find(
    (target) => target.props.buildConfigurationList.getDefaultBuildSetting("PRODUCT_BUNDLE_IDENTIFIER") === bundleId
  ) as PBXNativeTarget;
}
