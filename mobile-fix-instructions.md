# Mobile View Fix — Instructions for Claude CLI

## Context
Website ka **mobile view** kharab hai jabke desktop view perfect hai. 70%+ users mobile se aate hain, isliye yeh fix urgent hai. Do main issues hain:

1. **Chatbot icon** mobile view mein galat position par hai (side mein latka hua, center mein nahi)
2. **Extra side margin/padding** har page par hai jo content ko squeeze kar raha hai aur website buri lagti hai

---

## Prompt for Claude CLI

Copy-paste this exact prompt into Claude Code:

```
Meri website ka mobile responsive view broken hai. Do specific issues fix karne hain:

ISSUE 1 — Chatbot Widget Position:
- Chatbot icon currently mobile view mein misaligned hai, ek side par latka hua dikh raha hai
- Ise properly position karo: bottom-right corner mein fixed, safe area ke andar
- Ensure karo ke yeh koi doosra content overlap na kare
- CSS mein media query add karo specifically for mobile (max-width: 768px) jo chatbot ka bottom aur right spacing correctly set kare (e.g. bottom: 16px; right: 16px;)
- Z-index check karo taake yeh hamesha upar dikhe lekin content ko block na kare

ISSUE 2 — Extra Side Margin/Padding:
- Har page par mobile view mein unnecessary side margin/padding hai jo content ko squeeze kar raha hai
- Root cause dhundo: shayad container ki fixed width, ya body/html par extra margin, ya koi wrapper div jisme padding hardcoded hai
- Sab pages (home, product, category, cart, etc.) ke liye:
  - Container ka max-width mobile par 100% ya 100vw set karo
  - Unnecessary left/right padding/margin remove karo ya minimal rakho (e.g. 12px-16px max)
  - Box-sizing: border-box use karo taake padding width calculation mein add na ho
  - Horizontal scroll check karo — agar overflow-x ho raha hai toh uska source fix karo

Please:
1. Pehle mujhe batao ke yeh issues kahan (which files/components) se aa rahe hain
2. Phir har fix ke liye exact code changes dikhao before applying
3. Fix apply karne ke baad, mobile viewport (375px aur 414px width) par test karke confirm karo ke layout theek hai
4. Koi bhi desktop view ka layout is dauraan break nahi hona chahiye — sirf mobile-specific media queries mein changes karo
```

---

## Additional Notes for Claude CLI to Check

- Agar Shopify theme use ho raha hai: `theme.liquid`, `base.css`, ya section-specific CSS files check karne honge
- Agar custom React/Next.js site hai: global CSS, Tailwind config (agar breakpoints custom set hain), aur chatbot widget component check karo
- Chatbot agar third-party script hai (Tawk.to, Crisp, Tidio, etc.), toh unka apna mobile positioning config/dashboard bhi check karna hoga — sirf CSS override kaafi nahi ho sakta

---

## Testing Checklist (After Fix)

- [ ] iPhone SE (375px) par test
- [ ] iPhone 14 (390px) par test
- [ ] Samsung standard (360px) par test
- [ ] Chatbot bottom-right mein fixed aur clickable hai
- [ ] Koi horizontal scroll nahi ho raha
- [ ] Left/right padding consistent hai har page par
- [ ] Desktop view unaffected hai
