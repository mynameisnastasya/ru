import WinkBackendBridge from "@/components/WinkBackendBridge";
import WinkExperience from "@/components/WinkExperience";
import WinkOrderShortcut from "@/components/WinkOrderShortcut";

export default function Home() {
  return (
    <>
      <WinkExperience />
      <WinkBackendBridge />
      <WinkOrderShortcut />
    </>
  );
}
