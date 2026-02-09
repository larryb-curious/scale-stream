import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          &larr; Back
        </Link>

        <h1 className="text-3xl font-bold mt-6 mb-8">About</h1>

        <div className="space-y-5 text-gray-300 leading-relaxed">
          <p>
            Hey, I'm Larry. Thanks for visiting this page and trying out Scale
            Stream. I have been playing guitar and working in UX for a little
            while now. This is my first vibe coding project. I built this site
            with Claude Code one weekend just to see what the experience would be
            like.
          </p>

          <p>
            Even though I approached this as a code-with-AI project, I hope that
            guitar players, especially those who are first exploring their
            identity as improvisers, will find something useful here. Ultimately,
            it's all about what you hear and feel, but sometimes it can be
            helpful to have frameworks. For a lot of guitar players, I think we
            go through a phase where we are kind of stuck playing pentatonic
            scales over everything. Discovering the color and tension notes that
            occur in the major scale and its various modes can be a way into new
            feelings, new sounds, and to playing something that sounds a lot more
            on point with your chord progression.
          </p>

          <p>
            A couple of disclaimers about the recommendations that the site
            makes: First, remember that all the best improvisers approach soloing
            across multiple dimensions. The choice of scale or mode for a single
            tonal center is just one way to go, and admittedly the simplest way
            to make a website. Experiment and trust your ears always. Right now,
            this site is also pretty limited in that it will really only work
            with chord progressions common to rock, pop, country, basic R&B,
            etc. You won't be served any melodic minor or bebop scale
            recommendations, but still, I hope you can have fun here and maybe
            learn something. Thanks again for stopping by!
          </p>
        </div>
      </div>
    </div>
  );
}
