import Navbar from './components/Navbar/Navbar.jsx';
import Hero from './components/Hero/Hero.jsx';
import About from './components/About/About.jsx';
import Skills from './components/Skills/Skills.jsx';
import Projects from './components/Projects/Projects.jsx';
import Contact from './components/Contact/Contact.jsx';
import Footer from './components/Footer/Footer.jsx';
import BackToTop from './components/BackToTop/BackToTop.jsx';
function App(){
   return (
      <>
         <Navbar />
	 <Hero />
	 <About />
	 <Skills />
	 <Projects />
	 <Contact />
	 <Footer />
	 <BackToTop />
      </>
   );
}
export default App;
