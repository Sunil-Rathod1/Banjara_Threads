import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterOutlet],
  styles: [`
    .auth-panel {
      background: radial-gradient(ellipse at 30% 20%, #5a1010 0%, #2a0808 40%, #1a0505 100%);
    }
    .gold-line {
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
    }
    .banjara-pattern {
      background-image:
        repeating-linear-gradient(0deg,   transparent, transparent 39px, rgba(201,168,76,0.07) 39px, rgba(201,168,76,0.07) 40px),
        repeating-linear-gradient(90deg,  transparent, transparent 39px, rgba(201,168,76,0.07) 39px, rgba(201,168,76,0.07) 40px);
    }
    .diamond-accent::before, .diamond-accent::after {
      content: '◆';
      color: #c9a84c;
      opacity: 0.6;
      font-size: 8px;
      margin: 0 12px;
    }
    :host { display: block; min-height: 100vh; }
  `],
  template: `
    <div class="min-h-screen flex">

      <!-- ── Left luxury panel ─────────────────────────────────────────────── -->
      <aside class="hidden lg:flex lg:w-[52%] flex-col auth-panel relative overflow-hidden">

        <!-- Grid texture -->
        <div class="absolute inset-0 banjara-pattern"></div>

        <!-- Radial glow center -->
        <div class="absolute inset-0 pointer-events-none"
             style="background: radial-gradient(ellipse 60% 50% at 50% 55%, rgba(201,168,76,0.08) 0%, transparent 70%);">
        </div>

        <!-- Top: thin gold border line -->
        <div class="absolute top-0 left-0 right-0 h-px gold-line opacity-60"></div>
        <!-- Bottom: thin gold border line -->
        <div class="absolute bottom-0 left-0 right-0 h-px gold-line opacity-60"></div>
        <!-- Left: thin gold border -->
        <div class="absolute top-0 bottom-0 left-0 w-px"
             style="background: linear-gradient(180deg, transparent, #c9a84c55, transparent);"></div>
        <!-- Right: thin gold border -->
        <div class="absolute top-0 bottom-0 right-0 w-px"
             style="background: linear-gradient(180deg, transparent, #c9a84c55, transparent);"></div>

        <div class="relative z-10 flex flex-col justify-between h-full p-14">

          <!-- Logo top -->
          <div>
            <img src="logo.png" alt="Rathod Banjara Threads"
                 class="h-28 w-28"
                 style="border-radius: 50%; object-fit: cover; filter: drop-shadow(0 4px 24px rgba(201,168,76,0.35)) drop-shadow(0 0 60px rgba(201,168,76,0.15));" />
          </div>

          <!-- Center content -->
          <div class="text-center px-4">
            <!-- Decorative diamond -->
            <div class="flex items-center justify-center gap-4 mb-8">
              <div class="h-px flex-1" style="background: linear-gradient(90deg, transparent, #c9a84c66);"></div>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1 L17 9 L9 17 L1 9 Z" stroke="#c9a84c" stroke-width="1" fill="rgba(201,168,76,0.15)"/>
                <path d="M9 4 L14 9 L9 14 L4 9 Z" fill="#c9a84c" opacity="0.4"/>
              </svg>
              <div class="h-px flex-1" style="background: linear-gradient(90deg, #c9a84c66, transparent);"></div>
            </div>

            <p class="text-xs tracking-[0.35em] uppercase mb-6" style="color:#c9a84c; letter-spacing:0.3em;">
              Est. · Heritage Collection
            </p>

            <blockquote class="text-4xl leading-tight mb-6"
                        style="color:#faf6f0; font-family:'Playfair Display',serif; font-style:italic; font-weight:300;
                               text-shadow: 0 2px 20px rgba(0,0,0,0.5);">
              "Wear the<br><span style="color:#c9a84c;">Heritage"</span>
            </blockquote>

            <p class="text-sm leading-relaxed" style="color:rgba(250,246,240,0.55); font-weight:300; letter-spacing:0.04em;">
              Hand-embroidered Banjara art,<br>woven through generations of tribal artistry.
            </p>

            <!-- Decorative diamond bottom -->
            <div class="flex items-center justify-center gap-4 mt-8">
              <div class="h-px flex-1" style="background: linear-gradient(90deg, transparent, #c9a84c44);"></div>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="#c9a84c" opacity="0.5">
                <path d="M5 0 L10 5 L5 10 L0 5 Z"/>
              </svg>
              <div class="h-px flex-1" style="background: linear-gradient(90deg, #c9a84c44, transparent);"></div>
            </div>
          </div>

          <!-- Bottom wordmark -->
          <div class="text-center">
            <p class="text-xs tracking-[0.45em] uppercase" style="color:rgba(201,168,76,0.45); letter-spacing:0.4em;">
              Rathod · Banjara · Threads
            </p>
          </div>

        </div>
      </aside>

      <!-- ── Right form panel ───────────────────────────────────────────────── -->
      <main class="flex-1 flex items-center justify-center relative overflow-hidden"
            style="background: linear-gradient(160deg, #fdf9f5 0%, #faf6f0 50%, #f5ece1 100%);">

        <!-- Subtle background pattern -->
        <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
             style="background-image: radial-gradient(circle, #7b1c1c 1px, transparent 1px); background-size: 32px 32px;">
        </div>

        <!-- Corner accents -->
        <div class="absolute top-8 left-8 w-12 h-12 opacity-20"
             style="border-top: 1.5px solid #c9a84c; border-left: 1.5px solid #c9a84c;"></div>
        <div class="absolute top-8 right-8 w-12 h-12 opacity-20"
             style="border-top: 1.5px solid #c9a84c; border-right: 1.5px solid #c9a84c;"></div>
        <div class="absolute bottom-8 left-8 w-12 h-12 opacity-20"
             style="border-bottom: 1.5px solid #c9a84c; border-left: 1.5px solid #c9a84c;"></div>
        <div class="absolute bottom-8 right-8 w-12 h-12 opacity-20"
             style="border-bottom: 1.5px solid #c9a84c; border-right: 1.5px solid #c9a84c;"></div>

        <div class="relative z-10 w-full max-w-[420px] px-8 lg:px-0 py-12">

          <!-- Mobile logo -->
          <div class="flex justify-center mb-10 lg:hidden">
            <img src="logo.png" alt="Rathod Banjara Threads" class="h-24 w-24" style="border-radius: 50%; object-fit: cover;" />
          </div>

          <router-outlet />
        </div>
      </main>

    </div>
  `,
})
export class AuthComponent {}
