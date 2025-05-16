import { useState } from "react";
export default function AboutUs() {

  
  /*try {
    const response = await fetch("http://localhost:5000/send-order-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    alert(data.message);
  } catch (error) {
    alert("Error sending email");
    console.error(error);
  }*/
  const [formData,setformData] = useState({
    name : '',
    email : '',
    subject : '',
    query : '',
  })
  function handleChange(e){
    const {id,value} = e.target;
    console.log(id,value);
    setformData((prevData)=>({
      ...prevData,
    [id]:value,
    }))
  }

  async function handleSubmit(e){
    e.preventDefault();
    
    try{
      const response = await fetch("https://college-fair.onrender.com/send-query-email",{
        method : "POST",
        headers:{
          "Content-Type": "application/json",
        },
        body : JSON.stringify(formData)

      })
      const data = await response.json();
      alert(data.message);
    }
    catch(error){
      alert("Error Sending mail");
      console.log(error.message);
    }
  }

  console.log(formData);
 
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Redefining College Life through <span className="text-purple-600">CollegeFair</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto">
                Connecting students through a safe, intuitive marketplace designed exclusively for university communities.
              </p>
              <a
                href="/login"
                className="px-8 py-4 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 hover:-translate-y-1 inline-block"
              >
                Join Our Community
              </a>
            </div>
          </div>
        </section>
  
        {/* Our Story Section */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-full h-full bg-purple-200 rounded-2xl hidden sm:block"></div>
                  <div className="absolute -bottom-6 -right-6 w-full h-full bg-amber-200 rounded-2xl hidden sm:block"></div>
                  <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">
  Started by a group of students who understood the struggles of campus life, we set out to build more than just a marketplace — a platform where college life thrives.
</p>
<p className="text-gray-700 leading-relaxed">
  Our goal is to make this your all-in-one campus hub: from announcing events and fostering community interactions to sharing study materials and more. It’s not just about buying and selling — it’s about staying connected and growing together.
</p>

                  </div>
                </div>
              </div>
              <div className="md:w-1/2 mt-12 md:mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Secure</h3>
                    <p className="text-gray-600">Verified university emails ensure a trusted community of students.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Fast</h3>
                    <p className="text-gray-600">Connect with buyers and sellers instantly through our platform.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Local</h3>
                    <p className="text-gray-600">Meet on campus for safe, convenient exchanges.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Affordable</h3>
                    <p className="text-gray-600">No fees or commissions—keep more money in your pocket.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* How It Works Section - Based on the provided image, without arrows */}
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <div className="w-24 h-1 bg-purple-600 mx-auto"></div>
            </div>
  
            <div className="grid md:grid-cols-3 gap-8 sm:gap-12 max-w-6xl mx-auto">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-amber-400 flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Verify Student Status</h3>
                  <p className="text-gray-700 text-center">
                    Sign up with your university email to ensure a safe and secure marketplace exclusively for students.
                  </p>
                </div>
              </div>
  
              {/* Step 2 */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-purple-500 flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Buy & Sell With Ease</h3>
                  <p className="text-gray-700 text-center">
                    List your items with a description, set a price, and connect instantly with interested buyers through emails for now.
                  </p>
                </div>
              </div>
  
              {/* Step 3 */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-emerald-500 flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 22V12H15V22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Meet On Campus</h3>
                  <p className="text-gray-700 text-center">
                    Arrange a safe, convenient meetup right on campus to complete the sale hassle-free.
                  </p>
                </div>
              </div>
            </div>
  
            <div className="flex justify-center mt-12">
              <div className="w-16 h-16 rounded-full bg-rose-400 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </section>
  
        {/* Mission & Values */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Mission & Values</h2>
                <div className="w-24 h-1 bg-purple-600 mx-auto mb-8"></div>
                <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
                  We're building more than a marketplace—we're creating a community where students can connect, trade, and
                  thrive together.
                </p>
              </div>
  
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
                  <div className="h-2 bg-purple-600"></div>
                  <div className="p-6 sm:p-8">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Trust & Safety</h3>
                    <p className="text-gray-700">
                      We prioritize creating a secure environment where students can trade with confidence, knowing their
                      transactions are protected.
                    </p>
                  </div>
                </div>
  
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
                  <div className="h-2 bg-amber-500"></div>
                  <div className="p-6 sm:p-8">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Community</h3>
                    <p className="text-gray-700">
                      We believe in fostering meaningful connections between students, building a stronger campus
                      community through commerce.
                    </p>
                  </div>
                </div>
  
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
                  <div className="h-2 bg-emerald-500"></div>
                  <div className="p-6 sm:p-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Sustainability</h3>
                    <p className="text-gray-700">
                      By enabling students to buy and sell used items, we're promoting a more sustainable approach to
                      consumption on campus.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Contact Tech Team Section - NEW */}
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Contact Our Tech Team</h2>
                <div className="w-24 h-1 bg-purple-600 mx-auto mb-8"></div>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
  Have a question, a feature idea, or want to contribute your skills? Need technical help? We're here to support you—just reach out!
</p>

              </div>
  
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="p-6 sm:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                             onChange={(e)=>handleChange(e)}
                            type="text"
                            id="name"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            onChange={handleChange}
                            type="email"
                            id="email"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Your email"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                          Subject
                        </label>
                        <input
                          onChange={handleChange}
                          type="text"
                          id="subject"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="How can we help?"
                        />
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Message
                        </label>
                        <textarea
                          id="body"
                          rows="4"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Describe your issue or question"
                          onChange={handleChange}
                        ></textarea>
                      </div>
                      <div>
                        <button
                          type="submit"
                          onClick={handleSubmit}
                          className="w-full px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors shadow-lg hover:shadow-purple-200"
                        >
                          Send Message
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="bg-purple-600 p-6 sm:p-10 text-white flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <svg className="w-6 h-6 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm text-purple-200">Email</p>
                            <p className="font-medium">anmolgupta1502@gmail.com</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <svg className="w-6 h-6 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm text-purple-200">Phone</p>
                            <p className="font-medium">+91 - 9872148828</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <svg className="w-6 h-6 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm text-purple-200">Office</p>
                            <p className="font-medium">We Work Remotely :-)</p>
                            <p></p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-10">
                      <h4 className="font-medium mb-4">Support Hours</h4>
                      <p className="text-purple-200">Always availaible for you</p>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Call to Action */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-800"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full border-8 border-white opacity-20"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full border-8 border-white opacity-20"></div>
          </div>
  
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Join Our Community?</h2>
              <p className="text-lg sm:text-xl mb-10 text-purple-100">
                Experience the future of campus commerce today. Join thousands of students already using our platform.
              </p>
              <a
                href="/login"
                className="px-8 py-4 rounded-full bg-white text-purple-700 font-medium hover:bg-gray-100 transition-all shadow-lg hover:shadow-purple-900/20 hover:-translate-y-1 inline-block"
              >
                Sign Up Now
              </a>
            </div>
          </div>
        </section>
      </div>
    )
  }
  