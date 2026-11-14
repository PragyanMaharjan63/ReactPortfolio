import AboutPage from "@/views/AboutPage";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("About", site.description, "/about");
export default AboutPage;
