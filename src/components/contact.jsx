import { ArrowRight } from "lucide-react";
import ScrollWid from "./scrollwidget";
import { useForm, ValidationError } from "@formspree/react";
import Toast from "./toast";

export default function Contact() {
  const [state, handleSubmit] = useForm("meolyeok");

  return (
    <>
      <div className="flex flex-col justify-center relative items-center h-screen mt-40 sm:mt-0">
        <div className="flex grow flex-wrap justify-center items-center gap-20">
          <div className="flex flex-col w-80 sm:w-xl items-center justify-center gap-y-10">
            <p className="font-bold text-2xl sm:text-3xl my-10">CONTACT ME</p>
            <p>
              Hey there! 👋 I'm Pragyan Maharjan, a curious and enthusiastic
              Computer Science student who thrives on learning something new
              every day. From coding and web development to problem-solving, I'm
              always eager to explore and expand my knowledge. Let's build
              something amazing together!
            </p>
            <div className="flex flex-col justify-center items-center">
              <p className="font-bold text-2xl">Address</p>
              <p>Sunakothi, Lalitpur, Nepal</p>
            </div>
            <div className="flex flex-col justify-center items-center">
              <p className="font-bold text-2xl">E-mail</p>
              <p>pragyanmaharjan6k@gmail.com</p>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 max-w-md mx-auto p-4 rounded-md  md:w-[40vw]"
            >
              <div
                style={{ boxShadow: "-5px 5px 10px black" }}
                className="flex flex-col p-4 px-12 gap-y-4 justify-center"
              >
                <p className="font-bold text-2xl sm:text-3xl m-3 sm:m-10">
                  CONTACT FORM
                </p>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Name"
                  className="border-b border-gray-400 outline-none p-2"
                />

                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email"
                  className="border-b border-gray-400 outline-none p-2"
                />
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="border-b border-gray-400 outline-none p-2"
                />

                <textarea
                  name="message"
                  placeholder="Message"
                  rows="4"
                  className="border-b border-gray-400 outline-none p-2 resize-none"
                ></textarea>
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                />
                <div className="w-full inline-flex justify-center p-4">
                  <button
                    type="submit"
                    disabled={state.submitting}
                    className="flex m-4 ring-1 hover:ring-2 bg-white text-neutral-950 rounded-md transition-colors px-3 w-max py-1"
                  >
                    Send message
                    {<ArrowRight className="ml-2" />}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="hidden sm:flex rotate-90 absolute -bottom-30 lg:bottom-30 -right-20 lg:right-0">
          <ScrollWid bar={"top"} />
        </div>
        {state.succeeded && <Toast />}
      </div>
    </>
  );
}
