'use client';

import { useState, useRef, useEffect } from 'react';
import { Shield, Key, Users, Code, ArrowRight, Lock, Globe, Zap } from 'lucide-react';

export default function Homepage() {
  const canvasRef = useRef(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginType, setLoginType] = useState('');

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const particleCount = 80;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleLoginClick = (type) => {
    setLoginType(type);
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="https://ucarecdn.com/201a4688-4d6c-4c8f-a581-2a4d74f80633/-/format/auto/" 
                alt="PanixAuth Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
                PanixAuth
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#docs" className="text-gray-300 hover:text-white transition-colors">Docs</a>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-white to-blue-300 bg-clip-text text-transparent">
                Secure Your
              </span>
              <br />
              <span className="text-white">Applications</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Advanced key authentication system with HWID binding, unlimited key generation, 
              and comprehensive reseller management. Protect your software with enterprise-grade security.
            </p>
            
            {/* Login Buttons */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-20">
              <button
                onClick={() => handleLoginClick('admin')}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white font-semibold transition-all duration-300 hover:from-blue-500 hover:to-blue-600 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5" />
                  <span>Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
              
              <button
                onClick={() => handleLoginClick('user')}
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5" />
                  <span>User Login</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
              
              <button
                onClick={() => handleLoginClick('reseller')}
                className="group relative px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl text-white font-semibold transition-all duration-300 hover:from-gray-700 hover:to-gray-800 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/25"
              >
                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5" />
                  <span>Reseller Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to protect and monetize your software applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "HWID Binding",
                description: "Hardware-based protection with unique device fingerprinting and reset capabilities"
              },
              {
                icon: Zap,
                title: "Unlimited Keys",
                description: "Generate unlimited custom or random keys with flexible expiration settings"
              },
              {
                icon: Globe,
                title: "Multi-Platform",
                description: "Easy integration with C# WinForms applications and comprehensive documentation"
              },
              {
                icon: Users,
                title: "User Management",
                description: "Complete admin control over users, resellers, and their permissions"
              },
              {
                icon: Key,
                title: "Reseller System",
                description: "Built-in reseller functionality with customizable key limits and permissions"
              },
              {
                icon: Code,
                title: "Developer Friendly",
                description: "Simple API integration with downloadable C# library and code examples"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-blue-500/30 hover:scale-105"
              >
                <div className="text-blue-400 mb-4 group-hover:text-blue-300 transition-colors">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Secure Your Software?
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Join thousands of developers who trust PanixAuth to protect their applications
            </p>
            <button
              onClick={() => handleLoginClick('admin')}
              className="group relative px-12 py-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white text-lg font-semibold transition-all duration-300 hover:from-blue-500 hover:to-blue-600 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-3 inline group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img 
                src="https://ucarecdn.com/201a4688-4d6c-4c8f-a581-2a4d74f80633/-/format/auto/" 
                alt="PanixAuth Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg font-semibold text-white">PanixAuth</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 PanixAuth. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          loginType={loginType}
        />
      )}
    </div>
  );
}

function LoginModal({ isOpen, onClose, loginType }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType: loginType }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and redirect
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = `/${loginType}-dashboard`;
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    switch (loginType) {
      case 'admin': return 'Admin Dashboard';
      case 'user': return 'User Portal';
      case 'reseller': return 'Reseller Portal';
      default: return 'Login';
    }
  };

  const getModalIcon = () => {
    switch (loginType) {
      case 'admin': return Shield;
      case 'user': return Users;
      case 'reseller': return Key;
      default: return Lock;
    }
  };

  const Icon = getModalIcon();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{getModalTitle()}</h2>
          <p className="text-gray-400 mt-2">
            {loginType === 'admin' ? 'Admin access required' : 'Enter your credentials'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}