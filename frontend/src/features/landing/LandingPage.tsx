import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Target, 
  TrendingUp, 
  Shield, 
  Clock, 
  Brain,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Sparkles,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckSquare
} from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [missionProgress, setMissionProgress] = useState(0);
  const [confidence, setConfidence] = useState(65);
  const [risk, setRisk] = useState(35);
  const [tasksCompleted, setTasksCompleted] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMissionProgress(prev => (prev + 1) % 101);
      setConfidence(prev => Math.min(95, prev + 0.5));
      setRisk(prev => Math.max(5, prev - 0.3));
      setTasksCompleted(prev => (prev + 1) % 8);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const [plannerForm, setPlannerForm] = useState({
    goal: "",
    deadline: "",
    hours: ""
  });
  const [showPlan, setShowPlan] = useState(false);

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(110,231,255,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(52,211,153,0.04),transparent)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-300">AI-Powered Productivity</span>
            </motion.div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="text-gradient">Beat Deadlines,</span>
              <br />
              <span className="text-white">Not Just Remember Them</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
              Your AI proactively plans, prioritizes, predicts risks, and guides you to success — 
              instead of sending passive reminders that you ignore.
            </p>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button onClick={() => navigate("/login")} className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
            </motion.div>
          </motion.div>

          {/* Animated Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative panel-glow-accent p-6 rounded-3xl space-y-6">
              {/* Mission Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Launch AI Startup</h3>
                    <p className="text-sm text-gray-400">Due in 14 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">{missionProgress}%</div>
                  <div className="text-xs text-gray-400">Complete</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                  style={{ width: `${missionProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="panel-glow p-4 rounded-xl text-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-emerald-400">{Math.round(confidence)}%</div>
                  <div className="text-xs text-gray-400">Confidence</div>
                </div>
                <div className="panel-glow p-4 rounded-xl text-center">
                  <Shield className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-cyan-400">{Math.round(risk)}%</div>
                  <div className="text-xs text-gray-400">Risk Level</div>
                </div>
                <div className="panel-glow p-4 rounded-xl text-center">
                  <CheckSquare className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-purple-400">{tasksCompleted}/8</div>
                  <div className="text-xs text-gray-400">Tasks Done</div>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${i <= tasksCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'}`}>
                      {i <= tasksCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${i <= tasksCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {i === 1 ? 'Research market competitors' : i === 2 ? 'Build MVP prototype' : 'Create pitch deck'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 panel-glow p-3 rounded-xl"
            >
              <Zap className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-4 -left-4 panel-glow p-3 rounded-xl"
            >
              <Brain className="w-6 h-6 text-cyan-400" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gradient">How It Works</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Four simple steps to transform your productivity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Target, title: "Create Mission", desc: "Define your goal and deadline" },
              { icon: Brain, title: "AI Analysis", desc: "AI analyzes complexity and resources" },
              { icon: Calendar, title: "Execution Plan", desc: "Get a personalized step-by-step plan" },
              { icon: Rocket, title: "Success", desc: "Complete goals with confidence" }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="panel-glow p-8 rounded-2xl text-center space-y-4 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center mx-auto">
                    <step.icon className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                  <div className="absolute top-4 right-4 text-4xl font-bold text-white/5">
                    {i + 1}
                  </div>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive AI Mission Planner */}
      {/* <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gradient">Try the AI Mission Planner</span>
            </h2>
            <p className="text-xl text-gray-400">
              Enter your goal and see how AI would break it down
            </p>
          </motion.div>

          <div className="panel-glow-accent p-8 rounded-3xl">
            <form onSubmit={handleGeneratePlan} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Your Goal</label>
                <input
                  type="text"
                  placeholder="e.g., Learn Python in 30 days"
                  value={plannerForm.goal}
                  onChange={(e) => setPlannerForm({ ...plannerForm, goal: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-cyan-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Deadline</label>
                  <input
                    type="date"
                    value={plannerForm.deadline}
                    onChange={(e) => setPlannerForm({ ...plannerForm, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-cyan-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Available Hours/Week</label>
                  <input
                    type="number"
                    placeholder="e.g., 10"
                    value={plannerForm.hours}
                    onChange={(e) => setPlannerForm({ ...plannerForm, hours: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-cyan-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate AI Plan
              </button>
            </form>

            {showPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10 space-y-4"
              >
                <h3 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI-Generated Execution Plan
                </h3>
                <div className="space-y-3">
                  {[
                    "Week 1: Foundation & Setup",
                    "Week 2: Core Concepts",
                    "Week 3: Practical Projects",
                    "Week 4: Advanced Topics & Review"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">
                        {i + 1}
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Estimated Success Rate</span>
                    <span className="text-emerald-400 font-semibold">87%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400">Risk Level</span>
                    <span className="text-cyan-400 font-semibold">Low</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section> */}

      {/* Comparison Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gradient">Why Kairos Beats Traditional To-Do Apps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="panel-glow p-8 rounded-2xl space-y-6"
            >
              <h3 className="text-2xl font-semibold text-gray-400">Traditional To-Do Apps</h3>
              <ul className="space-y-4">
                {[
                  "Passive reminders you ignore",
                  "No planning or prioritization",
                  "Static lists that don't adapt",
                  "No risk prediction",
                  "Manual rescheduling required",
                  "No insights or analytics"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-400">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="panel-glow-accent p-8 rounded-2xl space-y-6"
            >
              <h3 className="text-2xl font-semibold text-cyan-400">AI Mission Control</h3>
              <ul className="space-y-4">
                {[
                  "Proactive planning & guidance",
                  "Smart prioritization based on goals",
                  "Dynamic adaptation to changes",
                  "Predictive risk analysis",
                  "Autonomous rescheduling",
                  "Deep productivity insights"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gradient">Powerful AI Capabilities</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "AI Mission Planning", desc: "Break down complex goals into actionable steps" },
              { icon: AlertTriangle, title: "Deadline Prediction", desc: "Know if you're on track to succeed" },
              { icon: BarChart3, title: "Smart Prioritization", desc: "Focus on what matters most right now" },
              { icon: Clock, title: "Personalized Focus Sessions", desc: "AI-optimized work blocks for maximum productivity" },
              { icon: Calendar, title: "Autonomous Rescheduling", desc: "Automatically adapt to changes and delays" },
              { icon: TrendingUp, title: "Productivity Insights", desc: "Learn from your patterns and improve" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="panel-glow p-6 rounded-2xl space-y-4 hover:border-cyan-500/30 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Mission Cards */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gradient">Popular Mission Types</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Land an AI Internship", icon: Brain, color: "from-purple-500 to-pink-500" },
              { title: "Crack GATE Exam", icon: Target, color: "from-orange-500 to-red-500" },
              { title: "Launch a Startup", icon: Rocket, color: "from-cyan-500 to-emerald-500" },
              { title: "Prepare for Exams", icon: BookOpen, color: "from-blue-500 to-indigo-500" }
            ].map((mission, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="panel-glow p-6 rounded-2xl space-y-4 hover:border-white/30 transition-all cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mission.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <mission.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold">{mission.title}</h3>
                <p className="text-sm text-gray-400">AI-optimized plan ready</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="panel-glow-accent p-12 rounded-3xl space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold">
              <span className="text-gradient">Ready to Beat Your Deadlines?</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of achievers who use AI to transform their productivity and reach their goals.
            </p>
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl font-semibold text-lg text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <Rocket className="w-6 h-6" />
              Create Your First Mission
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 Kairos. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function XCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function BookOpen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
