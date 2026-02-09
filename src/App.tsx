import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import ChordInput from './components/ChordInput'
import About from './components/About'
import SongTestGrid from './components/SongTestGrid'

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white pt-8 md:pt-24">
      <div className="w-full flex justify-end px-6 mb-6 md:mb-10">
        <Link
          to="/about"
          className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          About
        </Link>
      </div>
      <h1 className="text-5xl font-bold mb-4">Scale Stream</h1>
      <p className="text-xl text-gray-400 mb-8">Find your scale, then see and hear it.</p>
      <ChordInput />
    </div>
  )
}

function App() {
  if (window.location.hash === "#songs") return <SongTestGrid />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
