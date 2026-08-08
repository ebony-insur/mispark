import Link from "next/link";
import { ShieldAlert, Cpu, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const TARGET_MARKETS = [
  {
    id: "homeschool",
    title: "Homeschool & Unschooling Parents",
    image: "bg-[url('/screenshots/Homeschool.png')]", 
    link: "/why-spark/homeschool",
    issues: [
      "The Sunday Night Planning Scramble",
      "Adapting for Neurodivergent Learners",
      "Translating Child-Led Interests into Curriculum",
      "Juggling Multiple Age Groups"
    ]
  },
  {
    id: "teachers",
    title: "Classroom Teachers & IEP Facilitators",
    image: "bg-[url('/screenshots/Classroom2Tiny.png')]", 
    link: "/why-spark/teachers",
    issues: [
      "IEP Differentiation Exhaustion",
      "Strict FERPA/COPPA Data Compliance",
      "Emergency Substitute Plans",
      "Engaging Diverse Classrooms"
    ]
  },
  {
    id: "coops",
    title: "Homeschool Co-op Leaders",
    image: "bg-[url('/screenshots/Coop.png')]", 
    link: "/why-spark/coops",
    issues: [
      "Bridging the Volunteer Skill Gap",
      "Managing Mixed-Age Cohorts",
      "Standardizing Syllabi Across Classes",
      "Automating Supply Lists"
    ]
  },
  {
    id: "parents",
    title: "Traditional School Parents",
    image: "bg-[url('/screenshots/HomeworkTable2Tiny.png')]", 
    link: "/why-spark/parents",
    issues: [
      "The 'New Math' Homework Meltdown",
      "After-School Refusal & Burnout",
      "Preparing Parent Advocacy Briefs",
      "Safe, Private Digital Tutoring"
    ]
  }
];

export default function WhySparkPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="w-full px-6 pt-6 flex justify-center">
        <SiteHeader /> 
      </div>

      <div className="w-full max-w-6xl px-6 pt-16 pb-24 space-y-20">
        
        <section className="space-y-10">
          {/* FIX: Added header identifying these as concerns with traditional models */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-slate-900 mb-4">The Dangers of Traditional AI Models</h2>
            <p className="text-xl text-slate-600 font-medium">Why general-purpose AI tools like ChatGPT aren't safe or effective enough for your child's unique educational needs.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="bg-white border border-rose-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-rose-100 p-3 rounded-full">
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">The Shadow Profile Danger</h3>
              </div>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                <p>
                  When you ask public AI tools for help—<span className="italic">“How do I teach fractions to my 8-year-old with ADHD?”</span>—you are unintentionally feeding highly sensitive data into a public machine. General AI models use these daily interactions to build permanent shadow profiles of their users.
                </p>
                <p className="font-bold text-slate-900">
                  The Mi-Spark Vault:
                </p>
                <p>
                  We give you the power of AI with zero exposure. Your child's learning history is stored in an isolated, encrypted vault. We pass only anonymized data to our enterprise-grade models, and it is never used for training. 
                </p>
              </div>
            </div>

            <div className="bg-white border border-teal-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-teal-100 p-3 rounded-full">
                  <Cpu className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">The Prompt Problem</h3>
              </div>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                <p>
                  Typing a quick question into AI is easy. Engineering an AI to act as a master educator, align with state standards, adhere to IEP requirements, and generate physical household experiments is a full-time job.
                </p>
                <p className="font-bold text-slate-900">
                  You shouldn't have to be a Prompt Engineer.
                </p>
                <p>
                  Mi-Spark uses a complex, chained architecture of multiple elite AI models working together. We run thousands of lines of hidden pedagogical scripts on every single request so you don't have to. You just click "Generate."
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Choose Your Path</h2>
            <p className="text-lg text-slate-600 font-medium">Select your role to see how Mi-Spark solves your specific educational roadblocks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TARGET_MARKETS.map((market) => (
              <Link href={market.link} key={market.id} className="block group h-80 relative rounded-3xl overflow-hidden shadow-md">
                
                <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 ${market.image}`}>
                  <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/80 transition-colors duration-500"></div>
                </div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end transition-opacity duration-300 group-hover:opacity-0">
                  <h3 className="text-3xl font-bold text-white mb-2">{market.title}</h3>
                  <div className="flex items-center text-teal-400 font-bold">
                    See Solutions <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                </div>

                <div className="absolute inset-0 p-8 flex flex-col justify-center opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  <h3 className="text-2xl font-bold text-teal-400 mb-4 border-b border-white/20 pb-2">Key Issues Solved:</h3>
                  <ul className="space-y-3">
                    {market.issues.map((issue, idx) => (
                      <li key={idx} className="text-white font-medium flex items-start gap-2 text-lg">
                        <span className="text-teal-400 mt-1">•</span> {issue}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 inline-flex items-center px-4 py-2 bg-teal-500 text-white font-bold rounded-lg w-fit">
                    Explore Solutions <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>

              </Link>
            ))}
          </div>
        </section>

      </div>
      <SiteFooter />
    </main>
  );
}
//