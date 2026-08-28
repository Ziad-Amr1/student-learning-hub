import LandingHeader from './landing/LandingHeader'
import Hero from './landing/Hero'
import ValueProps from './landing/ValueProps'
import FeatureGrid from './landing/FeatureGrid'
import StudyLoop from './landing/StudyLoop'
import AboutSection from './landing/AboutSection'
import ClosingCta from './landing/ClosingCta'
import LandingFooter from './landing/LandingFooter'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        className="absolute -top-full left-2 z-(--z-skip-link) py-2 px-4 bg-primary text-primary-foreground rounded-md no-underline font-medium focus:top-2"
        href="#main-content"
      >
        Skip to content
      </a>
      <LandingHeader />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Hero />
        <ValueProps />
        <FeatureGrid />
        <StudyLoop />
        <AboutSection />
        <ClosingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
