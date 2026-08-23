import LandingHeader from './landing/LandingHeader'
import Hero from './landing/Hero'
import ValueProps from './landing/ValueProps'
import FeatureGrid from './landing/FeatureGrid'
import StudyLoop from './landing/StudyLoop'
import AboutSection from './landing/AboutSection'
import ClosingCta from './landing/ClosingCta'
import LandingFooter from './landing/LandingFooter'
import './LandingPage.css'

export default function LandingPage() {
  return (
    <div className="landing">
      <LandingHeader />
      <main id="main-content">
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
