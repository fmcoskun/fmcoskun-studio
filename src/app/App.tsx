import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { AboutSection } from '../features/about/AboutSection';
import { ContactSection } from '../features/contact/ContactSection';
import { HeroSection } from '../features/hero/HeroSection';
import { ProcessSection } from '../features/process/ProcessSection';
import { ProjectsSection } from '../features/projects/ProjectsSection';
import { ServicesSection } from '../features/services/ServicesSection';
import { ShowcaseLayer } from '../features/showcase/ShowcaseLayer';

export function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {/* Zero-height marker used by the header to know when the page has scrolled. */}
      <div id="top-sentinel" aria-hidden="true" style={{ position: 'absolute', top: 0, height: 1, width: 1 }} />
      <Header />
      <main id="main" tabIndex={-1}>
        <HeroSection />
        <ServicesSection />
        <ProjectsSection />
        <ProcessSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <ShowcaseLayer />
    </>
  );
}
