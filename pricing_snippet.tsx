      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-8 lg:px-12 relative z-10 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-100/30 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-50/40 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto">
          <FadeContent>
            {/* Header */}
            <div className="text-center mb-20">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-full text-sm font-medium mb-6 border border-stone-200/60">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Flexible Plans
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight mb-6">
                Transparent pricing for <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-stone-700 to-stone-900">every signer</span>
              </h2>
              <p className="text-stone-500 max-w-lg mx-auto text-lg leading-relaxed mb-10">
                Scale as you grow. Start with our generous free tier and upgrade as your needs evolve.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-16">
                <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-stone-900' : 'text-stone-400'}`}>Monthly</span>
                <button
                  onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative w-14 h-7 bg-stone-200 rounded-full p-1 transition-colors hover:bg-stone-300 cursor-pointer"
                >
                  <motion.div
                    animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                  />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-stone-900' : 'text-stone-400'}`}>Yearly</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Save up to 25%</span>
                </div>
              </div>
            </div>


            {/* Pricing Cards */}
            <div className="flex flex-col md:flex-row justify-center gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
              {pricingTiers.map((plan, idx) => (
                <div
                  key={plan.name}
                  className="relative flex flex-col p-8 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300 w-full md:w-1/3"
                >
                  {/* Icon */}
                  <div className="mb-6 h-12 flex items-center text-stone-900">
                    {plan.name === 'Free' && (
                       <div className="relative flex items-center justify-center w-12 h-12">
                          <PenTool className="w-8 h-8" strokeWidth={1.5} />
                       </div>
                    )}
                    {plan.name === 'Pro' && (
                       <div className="relative w-12 h-12">
                          <PenTool className="w-6 h-6 absolute top-0 left-1 text-stone-900" strokeWidth={1.5} />
                          <svg className="w-8 h-8 absolute bottom-0 right-0 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            {/* Low scribble path */}
                            <path d="M4 18c2-1 4-1 6 0 2 1 4 1 6 0" />
                          </svg>
                       </div>
                    )}
                    {plan.name === 'Pro Plus' && (
                       <div className="relative w-12 h-12">
                          <PenTool className="w-6 h-6 absolute top-0 left-1 text-stone-900" strokeWidth={1.5} />
                          {/* Top Scribble */}
                          <svg className="w-8 h-8 absolute bottom-2 right-0 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 18c2-1 4-1 6 0 2 1 4 1 6 0" />
                          </svg>
                          {/* Bottom Scribble */}
                          <svg className="w-8 h-8 absolute -bottom-1 right-0 text-stone-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 18c2-1 4-1 6 0 2 1 4 1 6 0" />
                          </svg>
                       </div>
                    )}
                  </div>

                  {/* Plan Name & Desc */}
                  <div className="mb-4">
                    <h3 className="text-3xl font-serif font-medium text-stone-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-stone-500">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-stone-900">
                         {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </span>
                    </div>
                     <p className="text-xs text-stone-400 mt-1">
                        {
                            plan.name === 'Free' ? 'Free for everyone' :
                            billingCycle === 'yearly' ? 'Per month, billed annually' : 'Per month, billed monthly'
                        }
                     </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleCheckout(plan.planId, plan.name)}
                    disabled={!!checkoutLoading}
                    className={`w-full py-2.5 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 mb-8 cursor-pointer
                      ${plan.highlighted
                        ? 'bg-stone-900 text-white hover:bg-stone-800'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {checkoutLoading === plan.name ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        plan.cta
                    )}
                  </button>

                  {/* Features */}
                  <ul className="space-y-4 flex-1">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm text-stone-600">
                        <svg className="w-5 h-5 text-stone-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-20 text-center">
              <p className="text-stone-400 text-sm">
                Secure payment processing by
                <span className="mx-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 rounded-md font-semibold text-stone-700">
                  {/* Paddle Brand Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="6" fill="#18181B" />
                    <path d="M12 6L13.4 10.6L18 12L13.4 13.4L12 18L10.6 13.4L6 12L10.6 10.6L12 6Z" fill="#FACC15" />
                  </svg>
                  Paddle
                </span>
              </p>
            </div>
          </FadeContent>
        </div>
      </section>
