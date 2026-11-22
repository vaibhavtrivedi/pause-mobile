# PAUSE — Mobile prototype v0.3

## What is new in v0.3
- Bubble Ocean has gentle floating motion and a more supportive prompt.
- Session history screen with locally stored activity, date, duration, and optional feeling check-in.
- History is stored on-device with AsyncStorage; no account, server, or cloud sync.
- Completion check-in now saves a session before returning home.
- Home and activity selection provide access to session history.
- Accessibility labels added to feeling scale and bubble controls.

## Included from v0.2
- Expo Router app structure and three calming activities.
- 60-second breathing session, pause/resume/restart, optional haptics.
- Response Challenge with reflective feedback.

## Run locally
1. Install Node.js LTS.
2. Unzip and enter the `pause-mobile-v0.3` folder.
3. Run `npm install`.
4. Run `npx expo start`.
5. Open with Expo Go or an iOS/Android simulator.

## Known limitations
- This is a prototype; no successful device build or physical-device test has yet been completed.
- Ambient audio and voice guidance are not included in this release. They need original audio assets, user-controlled volume/mute, and platform testing.
- The breathing rhythm is optional. Users should return to natural breathing or stop if uncomfortable; no breath holds are instructed.
- This is not a medical device or clinically validated treatment. It must not promise to reduce anger or distress in a fixed time.
- AI personalisation, child/guardian controls, and cloud services are intentionally not enabled yet.

## Build an installable Android testing APK (cloud build)
This repository includes an Expo Application Services (EAS) preview profile. A signed APK is produced by Expo's cloud builder; this source package itself is not an APK.

1. Create/sign in to an Expo account at https://expo.dev/.
2. In this folder, run `npm install`.
3. Run `npx eas-cli login` and then `npx eas-cli build:configure` if prompted.
4. Run `npx eas-cli build --platform android --profile preview`.
5. When the cloud build finishes, open the build URL printed by EAS and download the `.apk` to your Android phone. Allow installation from that source if Android asks.

For a Play Store release, use `npx eas-cli build --platform android --profile production`; that profile creates an Android App Bundle (AAB), not a sideloadable APK. Do not treat the preview build as a production release.

The first EAS build requires an Expo account and may ask you to create or configure an Android signing key. Keep the generated credentials private and backed up.
