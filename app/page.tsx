'use client';

import { useState } from 'react';
import { ChevronDown, Zap, Database, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from './hooks';
import { useFetchPostsQuery } from './features/dogs/dogs-api-slice';
import { amountAdded, incremented } from './features/counter/counter-slice';

export default function Home() {
  const count = useAppSelector((state: any) => state.counter.value);
  const dispatch = useAppDispatch();
  const [numPosts, setNumPosts] = useState<number>(10);
  const [isCounterHovered, setIsCounterHovered] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(true);
  const { data, isFetching } = useFetchPostsQuery(numPosts);

  function handleClick() {
    dispatch(incremented());
    // dispatch(amountAdded(3));
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        {/* Animated Background */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10 lg:mb-12 transform hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-400 mr-2 sm:mr-3 animate-spin" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              ULTIMATE
            </h1>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-400 ml-2 sm:ml-3 animate-spin" />
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white/90 mb-3 sm:mb-4">Counter Experience</h2>
          <p className="text-sm sm:text-base lg:text-lg text-white/70 max-w-xs sm:max-w-md lg:max-w-lg mx-auto leading-relaxed px-4">
            A stunning counter with <span className="text-cyan-400 font-semibold">Next.js</span>,
            <span className="text-purple-400 font-semibold"> Redux</span>, and
            <span className="text-pink-400 font-semibold"> RTK Query</span>
          </p>
        </div>

        {/* Counter Button */}
        <div className="mb-10 sm:mb-12 lg:mb-16 w-full max-w-sm">
          <button
            onClick={handleClick}
            onMouseEnter={() => setIsCounterHovered(true)}
            onMouseLeave={() => setIsCounterHovered(false)}
            className="group relative w-full px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-lg sm:text-xl lg:text-2xl font-bold text-white rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 lg:hover:scale-110 active:scale-95 touch-manipulation"
          >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl"></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Animated Border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            <div className="absolute inset-[2px] bg-black/20 backdrop-blur-xl rounded-2xl"></div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
              <Zap className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${isCounterHovered ? 'text-yellow-400 animate-bounce' : 'text-white'}`} />
              <span className="truncate">Count: {count}</span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center text-xs sm:text-sm font-black text-black flex-shrink-0">
                {count}
              </div>
            </div>

            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200"></div>
          </button>
        </div>

        {/* Posts Control Section */}
        <div className="mb-8 sm:mb-10 lg:mb-12 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 max-w-xs sm:max-w-sm lg:max-w-md w-full mx-4 transform hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mr-2 sm:mr-3" />
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Data Control</h3>
          </div>

          <div className="relative">
            <select
              value={numPosts}
              onChange={(e) => setNumPosts(Number(e.target.value))}
              className="w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 bg-black/30 text-white rounded-lg sm:rounded-xl border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-base sm:text-lg font-semibold cursor-pointer appearance-none backdrop-blur-xl transition-all duration-300"
            >
              <option value="5">5 Posts</option>
              <option value="10">10 Posts</option>
              <option value="15">15 Posts</option>
              <option value="20">20 Posts</option>
              <option value="25">25 Posts</option>
            </select>
            <ChevronDown className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-white/60 pointer-events-none" />
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <span className="inline-block px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full text-green-400 text-sm sm:text-base font-semibold border border-green-500/30">
              {data?.length} Posts Loaded
            </span>
          </div>
        </div>

        {/* Toggle Table Visibility */}
        <button
          onClick={() => setIsTableVisible(!isTableVisible)}
          className="mb-6 sm:mb-8 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base rounded-lg sm:rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-xl touch-manipulation"
        >
          {isTableVisible ? 'Hide' : 'Show'} Data Table
        </button>

        {/* Data Table */}
        <div className={`transform transition-all duration-700 ease-in-out w-full max-w-7xl ${isTableVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
          <div className="mx-4 sm:mx-6 lg:mx-8 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-black/20 backdrop-blur-2xl border border-white/10 overflow-hidden">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">Dynamic Data Showcase</h3>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-full inline-block align-middle">
                <table className="w-full min-w-[600px] sm:min-w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base lg:text-lg">Title</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-white font-bold text-sm sm:text-base lg:text-lg">Content</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.map((post, index) => (
                      <tr
                        key={post.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors duration-300 group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 lg:py-6">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                              {post.id}
                            </div>
                            <span className="text-white font-semibold group-hover:text-purple-300 transition-colors duration-300 text-sm sm:text-base break-words">
                              {post.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 lg:py-6 text-white/80 group-hover:text-white transition-colors duration-300 text-sm sm:text-base">
                          <div className="max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg">
                            {post.body}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 sm:mt-16 text-center px-4">
          <p className="text-white/50 text-xs sm:text-sm">
            Edit <code className="px-2 py-1 bg-white/10 rounded border border-white/20 text-cyan-400 font-mono text-xs sm:text-sm">app/page.tsx</code> to customize this experience
          </p>
        </div>
      </main>
    </div>
  );
}