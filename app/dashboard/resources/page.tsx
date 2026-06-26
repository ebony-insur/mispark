"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, ShoppingBag, Headphones, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResourcesHub() {
  const router = useRouter();

  const resources = [
    {
      title: "Audible Plus",
      description: "The absolute best library for on-the-go learning. Get unlimited access to thousands of audiobooks and podcasts.",
      icon: <Headphones className="w-8 h-8 text-amber-500" />,
      color: "border-t-amber-500",
      btnColor: "bg-amber-500 hover:bg-amber-600 text-white",
      link: "https://www.amazon.com/hz/audible/mlp/membership/plus?tag=YOUR_AMAZON_TAG",
      btnText: "Start Free Trial"
    },
    {
      title: "Amazon Prime",
      description: "Fast delivery on all our recommended Family Game Night board games, craft supplies, and workbooks.",
      icon: <ShoppingBag className="w-8 h-8 text-blue-500" />,
      color: "border-t-blue-500",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
      link: "https://www.amazon.com/amazonprime?tag=YOUR_AMAZON_TAG",
      btnText: "Try Prime Free"
    },
    {
      title: "Walmart+",
      description: "Perfect for grabbing those Quick-Trip Spark supplies at the last minute with free local delivery.",
      icon: <ShoppingBag className="w-8 h-8 text-sky-500" />,
      color: "border-t-sky-500",
      btnColor: "bg-sky-600 hover:bg-sky-700 text-white",
      link: "https://www.walmart.com/plus?affiliate_id=YOUR_WALMART_TAG",
      btnText: "Explore Walmart+"
    },
    {
      title: "Libby App (Free)",
      description: "Connect your local library card to check out digital audiobooks and ebooks entirely for free.",
      icon: <Smartphone className="w-8 h-8 text-rose-500" />,
      color: "border-t-rose-500",
      btnColor: "bg-rose-600 hover:bg-rose-700 text-white",
      link: "https://libbyapp.com/",
      btnText: "Download Libby"
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-6 bg-slate-50 space-y-8">
      
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <button 
          onClick={() => router.push("/dashboard")}
          className="flex items-center text-slate-500 hover:text-slate-800 transition font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>
        <div className="text-xl font-extrabold tracking-tight">
          <span className="text-teal-500">mi</span>
          <span className="text-orange-500">Spark</span> Hub
        </div>
      </div>

      <div className="w-full max-w-4xl text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-800">Recommended Tools & Apps</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          We curate the best resources to make homeschooling easier. Creating accounts with these services will let you grab our weekly recommendations instantly.
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res, i) => (
          <Card key={i} className={`shadow-md border-0 border-t-4 ${res.color} bg-white hover:shadow-lg transition-shadow`}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                {res.icon}
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">{res.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-600 leading-relaxed">{res.description}</p>
              <a 
                href={res.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex w-full justify-center items-center py-3 rounded-lg font-bold transition-colors ${res.btnColor}`}
              >
                {res.btnText}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}