import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import ScrollWid from "./scrollwidget";
import { useForm, ValidationError } from "@formspree/react";
import Toast from "./toast";
import SocialMedia from "./socialmedia";

// Vite inlines this at build time. When it is missing it is `undefined`, and
// useForm() throws on an empty id — which unmounts the entire app and renders
// a blank page. Keep that failure inside the form instead.
const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID;

export default function Contact() {
  const formReady = Boolean(FORMSPREE_ID);
  const [state, handleSubmit] = useForm(FORMSPREE_ID || "form-not-configured");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!state.succeeded) return;

    setShowToast(true);
    const timeoutId = setTimeout(() => {
      setShowToast(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [state.succeeded]);

  return (
    <div className="relative flex flex-col items-center justify-center px-5 py-24 sm:py-28">
      <div className="flex w-full max-w-6xl flex-wrap items-start justify-center gap-x-16 gap-y-14">
        <div className="flex w-full max-w-md flex-col items-center gap-y-8 text-center">
          <h2 className="section-title">CONTACT ME</h2>

          <p className="text-ink-muted">
            Hey there! 👋 I&apos;m Pragyan Maharjan, a curious and enthusiastic
            Computer Science student who thrives on learning something new every
            day. From coding and web development to problem-solving, I&apos;m
            always eager to explore and expand my knowledge. Let&apos;s build
            something amazing together!
          </p>

          <div className="flex flex-col items-center gap-y-1">
            <p className="font-display text-lg font-bold text-white">Address</p>
            <p className="text-ink-muted">Sunakothi, Lalitpur, Nepal</p>
          </div>

          <div className="flex flex-col items-center gap-y-1">
            <p className="font-display text-lg font-bold text-white">E-mail</p>
            <a
              href="mailto:pragyanmaharjan6k@gmail.com"
              className="inline-flex min-h-11 items-center text-ink-muted underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              pragyanmaharjan6k@gmail.com
            </a>
          </div>

          <div className="block sm:hidden">
            <SocialMedia />
          </div>
        </div>

        <form
          onSubmit={formReady ? handleSubmit : (e) => e.preventDefault()}
          className="flex w-full max-w-md flex-col gap-y-5 rounded-2xl
                     border border-line bg-surface/60 p-7 shadow-2xl
                     shadow-black/40 sm:p-9"
        >
          <p className="mb-1 text-center font-display text-2xl font-bold tracking-wide text-white">
            CONTACT FORM
          </p>

          <div className="flex flex-col gap-y-1.5">
            <label htmlFor="contact-name" className="text-sm text-ink-muted">
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="Your name"
              className="field"
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <label htmlFor="contact-email" className="text-sm text-ink-muted">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="field"
            />
            <ValidationError
              prefix="Email"
              field="email"
              errors={state.errors}
              className="text-sm text-red-400"
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <label htmlFor="contact-phone" className="text-sm text-ink-muted">
              Phone Number
            </label>
            <input
              id="contact-phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="Optional"
              className="field"
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <label htmlFor="contact-message" className="text-sm text-ink-muted">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows="4"
              required
              placeholder="Your message"
              className="field resize-none"
            ></textarea>
            <ValidationError
              prefix="Message"
              field="message"
              errors={state.errors}
              className="text-sm text-red-400"
            />
          </div>

          {!formReady && (
            <p className="text-sm text-amber-400">
              The form is not configured. Email me directly at{" "}
              <a className="underline" href="mailto:pragyanmaharjan6k@gmail.com">
                pragyanmaharjan6k@gmail.com
              </a>
              .
            </p>
          )}

          <button
            type="submit"
            disabled={state.submitting || !formReady}
            className="btn btn-primary mt-2 self-center"
          >
            {state.submitting ? "Sending..." : "Send message"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="absolute right-0 -bottom-30 hidden rotate-90 sm:flex lg:bottom-30">
        <ScrollWid bar={"top"} />
      </div>

      {showToast && <Toast />}
    </div>
  );
}
