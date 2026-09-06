import type { Metadata } from "next";
import { AiProviderSettings } from "@/components/tools/ai-provider-settings";

import { ErrorExplainer } from "@/components/core/error-explainer";
import { WorkflowPlanner } from "@/components/workflows/workflow-planner";
import { ArrowRight, LifeBuoy, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import styles from "./assistant.module.css";

export const metadata: Metadata = {
  title: "AI Assistant",
  description:
    "Optional bring-your-own-key AI assistance for planning DevHub tool workflows.",
  alternates: { canonical: "/assistant" },
  robots: { index: false, follow: true },
};

export default function AssistantPage() {
  return (
    <div className={styles.stack}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><Sparkles size={13} /> AI workspace</span>
          <h2 className={styles.heroTitle}>Think through the work.<br /><span>Keep control of the data.</span></h2>
          <p>Optional AI tools for planning workflows and understanding errors, powered by your own provider and stored locally.</p><div className={styles.heroActions}><a className={styles.primaryAction} href="#assistant-step-provider">Configure provider <ArrowRight size={14} /></a><a className={styles.secondaryAction} href="#assistant-step-plan">See workflow planning</a></div>
        </div>
        <div className={styles.localBadge}><span /> BYOK · local-first</div>
      </header>
      <div className={styles.capabilities} aria-label="Assistant capabilities">
        <div><Workflow size={15} /><span><strong>Workflow planning</strong><small>Turn an outcome into tool steps</small></span></div>
        <div><LifeBuoy size={15} /><span><strong>Error explanations</strong><small>Understand failures faster</small></span></div>
        <div><ShieldCheck size={15} /><span><strong>Your key, your endpoint</strong><small>Nothing runs without consent</small></span></div>
      </div>
      <div className={styles.onboarding}>
        <section className={styles.step} aria-labelledby="assistant-step-provider">
          <div className={styles.stepRail}><span>01</span><i /></div>
          <div className={styles.stepContent}>
            <div className={styles.stepHeading}><span>Start here</span><h2 id="assistant-step-provider">Connect your AI provider</h2><p>Choose Gemini, OpenAI, OpenRouter, Ollama, or a compatible endpoint. Your key stays in this browser.</p></div>
            <AiProviderSettings />
          </div>
        </section>
        <section className={styles.step} aria-labelledby="assistant-step-plan">
          <div className={styles.stepRail}><span>02</span><i /></div>
          <div className={styles.stepContent}>
            <div className={styles.stepHeading}><span>Build a path</span><h2 id="assistant-step-plan">Plan your workflow</h2><p>Describe the outcome and get a reviewable chain of local tools before anything runs.</p></div>
            <WorkflowPlanner />
          </div>
        </section>
        <section className={styles.step} aria-labelledby="assistant-step-error">
          <div className={styles.stepRail}><span>03</span></div>
          <div className={styles.stepContent}>
            <div className={styles.stepHeading}><span>When things break</span><h2 id="assistant-step-error">Understand an error</h2><p>Send only the tool name and error message for a focused explanation.</p></div>
            <ErrorExplainer />
          </div>
        </section>
      </div>
    </div>
  );
}
