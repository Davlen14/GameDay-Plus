import React, { useEffect } from 'react';

const Hero = () => {
  useEffect(() => {
    // Initialize particles.js if available
    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#D4001C"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#FF6666",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 6,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
      });
    }
  }, []);

  return (
    <section id="home" className="relative gradient-bg text-white py-20 px-6 md:px-12 rounded-b-3xl shadow-xl min-h-screen flex items-center justify-center">
      <div id="particles-js" className="absolute top-0 left-0 w-full h-full"></div>
      <div className="max-w-6xl mx-auto text-center hero-content" data-aos="fade-up">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-6 drop-shadow-lg hero-logo">
          GAMEDAY+
        </h1>
        <p className="text-2xl md:text-3xl lg:text-4xl font-medium mb-8">
          The <span className="font-bold">Ultimate College Football Intelligence Platform</span>
        </p>
        <p className="text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto mb-10 opacity-90">
          GAMEDAY+ provides deeper insights than ESPN, The Athletic, and traditional sports apps combined, with <span className="font-bold">comprehensive modules</span> covering every aspect of college football.
        </p>
        <div className="cta-button-elevated text-xl font-bold py-4 px-10 rounded-lg shadow-lg">
          <span className="cta-text">EXPLORE ALL MODULES</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
