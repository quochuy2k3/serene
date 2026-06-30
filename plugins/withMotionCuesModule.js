/**
 * Expo config plugin: wires up the Motion Cues native module on Android.
 *
 * 1. Copies Kotlin sources + drawable from plugins/motion-cues-native/ into android/
 * 2. Registers MotionCuesPackage() in MainApplication.kt
 * 3. Adds required permissions to AndroidManifest.xml
 * 4. Declares the <service> element with specialUse foreground type
 */
const fs = require("fs");
const path = require("path");
const {
  withAndroidManifest,
  withMainApplication,
  withDangerousMod,
  AndroidConfig,
} = require("@expo/config-plugins");

const PACKAGE_NAME = "com.serene.app";
const PACKAGE_INSTANTIATION = "add(MotionCuesPackage())";

const NATIVE_FILES = {
  kotlin: ["MotionCuesService.kt", "MotionCuesModule.kt", "MotionCuesPackage.kt"],
  drawable: ["motion_cue_dot.xml"],
};

// --- Dangerous mod: copy native source files into android/ ---
const withMotionCuesNativeFiles = (config) =>
  withDangerousMod(config, [
    "android",
    (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformRoot = config.modRequest.platformProjectRoot;
      const templateDir = path.join(projectRoot, "plugins", "motion-cues-native");

      // Copy Kotlin files into android/app/src/main/java/com/serene/app/
      const javaDir = path.join(
        platformRoot,
        "app",
        "src",
        "main",
        "java",
        ...PACKAGE_NAME.split(".")
      );
      fs.mkdirSync(javaDir, { recursive: true });
      for (const file of NATIVE_FILES.kotlin) {
        const src = path.join(templateDir, "java", file);
        const dest = path.join(javaDir, file);
        fs.copyFileSync(src, dest);
      }

      // Copy drawable resources into android/app/src/main/res/drawable/
      const drawableDir = path.join(
        platformRoot,
        "app",
        "src",
        "main",
        "res",
        "drawable"
      );
      fs.mkdirSync(drawableDir, { recursive: true });
      for (const file of NATIVE_FILES.drawable) {
        const src = path.join(templateDir, "res", "drawable", file);
        const dest = path.join(drawableDir, file);
        fs.copyFileSync(src, dest);
      }

      return config;
    },
  ]);

// --- Manifest mod: permissions + <service> element ---
const withMotionCuesManifest = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // Permissions (dedupe against existing)
    const permissions = [
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_SPECIAL_USE",
      "android.permission.POST_NOTIFICATIONS",
    ];

    const existingPermissions = new Set(
      (manifest.manifest["uses-permission"] ?? []).map(
        (p) => p.$["android:name"]
      )
    );

    for (const permission of permissions) {
      if (!existingPermissions.has(permission)) {
        AndroidConfig.Permissions.addPermission(manifest, permission);
        existingPermissions.add(permission);
      }
    }

    // <service> element
    const application = manifest.manifest.application?.[0];
    if (!application) {
      throw new Error("Cannot find <application> in AndroidManifest.xml");
    }

    if (!application.service) {
      application.service = [];
    }

    const SERVICE_NAME = ".MotionCuesService";
    const existingIndex = application.service.findIndex(
      (s) => s.$?.["android:name"] === SERVICE_NAME
    );

    const serviceEntry = {
      $: {
        "android:name": SERVICE_NAME,
        "android:foregroundServiceType": "specialUse",
        "android:exported": "false",
      },
      property: [
        {
          $: {
            "android:name": "android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE",
            "android:value":
              "Motion cues overlay displayed at screen edges to reduce motion sickness symptoms. Does not read screen content.",
          },
        },
      ],
    };

    if (existingIndex >= 0) {
      application.service[existingIndex] = serviceEntry;
    } else {
      application.service.push(serviceEntry);
    }

    return config;
  });

// --- MainApplication.kt mod: register MotionCuesPackage ---
const withMotionCuesMainApplication = (config) =>
  withMainApplication(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes(PACKAGE_INSTANTIATION)) {
      contents = contents.replace(
        /PackageList\(this\)\.packages\.apply \{([\s\S]*?)\}/,
        (_, body) => {
          const trimmed = body.trimEnd();
          return `PackageList(this).packages.apply {${trimmed}\n              ${PACKAGE_INSTANTIATION}\n            }`;
        }
      );
    }

    config.modResults.contents = contents;
    return config;
  });

module.exports = (config) => {
  config = withMotionCuesNativeFiles(config);
  config = withMotionCuesManifest(config);
  config = withMotionCuesMainApplication(config);
  return config;
};
