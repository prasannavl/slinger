import { Head } from "$fresh/runtime.ts";
import ChatInterface from "../islands/ChatInterface.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Slinger - AI Crypto Trading</title>
      </Head>
      <main class="app-container">
        <ChatInterface />
      </main>
    </>
  );
}
