import React from 'react'

function Footer() {
  return (
    <div className="space-y-4">
      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 space-y-3">
        <h2 className="text-sm md:text-base font-semibold text-slate-100">
          Roast Category Explanation
        </h2>
        <p className="text-xs md:text-sm text-slate-400">
          This classification uses a CNN model for Computer Vision to classify coffee bean
          images into the following four roast levels. You can also use this short explanation
          later in your report or poster.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs md:text-sm">
          <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-50">Green</span>
              <span className="text-[10px] text-emerald-300">Unroasted</span>
            </div>
            <p className="text-slate-400 text-xs">
              Raw green coffee beans with high moisture content and not yet roasted.
              Texture tends to be hard with grassy/herbal aroma.
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-50">Light</span>
              <span className="text-[10px] text-amber-300">Light roast</span>
            </div>
            <p className="text-slate-400 text-xs">
              Light brown color, highlights the origin character (high acidity,
              fruity/flower notes). Oils haven’t appeared much on the surface.
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-50">Medium</span>
              <span className="text-[10px] text-orange-300">Balanced</span>
            </div>
            <p className="text-slate-400 text-xs">
              Medium brown, balanced between acidity, sweetness, and body.
              Commonly used for daily brewing because the taste is relatively neutral.
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-50">Dark</span>
              <span className="text-[10px] text-rose-300">Dark roast</span>
            </div>
            <p className="text-slate-400 text-xs">
              Dark brown to almost black, oily surface, with bitter and smoky taste.
              Origin flavor tends to be covered by the roast characteristics.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Hint */}
      <div className="pt-2 border-t border-slate-800/70 text-sm text-slate-500 flex flex-wrap items-center justify-between gap-x-2">
        <p>CoffieRizer {new Date().getFullYear()}</p>
        <p>Created by Aam, Gia, Kinan, Nadhilah, & Syamsul</p>
      </div>
    </div>
  )
}

export default Footer
