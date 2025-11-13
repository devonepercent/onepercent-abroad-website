const UniversityLogos = () => {
  const logos = [
    {
      name: "Harvard University",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOTDipX0UJwHES0lU7_6cMRAM5Lv82mYv0yQtQIU6s4vxu47Fraz1xhHfRoLnIGINWXl7MokOGeFNrrXp4ZBo_ARPqoPCCuGv5mJeHRGGIhWcN8MJG7vTO9KDoxV2_PuDU-dchmO1IC6WMJjqztZ9U9_j9TqLqc1SVX61Px7QmYnVEfSJiEYPXVFriGlFaTVCnx9B_7Bw2lWYFyCg1WtO8gP3OInKMdRpYLO3ywXQF29Wc1-kG0BmKmHHntf_byAE-wRRwbyehtg",
      height: "h-8 md:h-10",
    },
    {
      name: "Stanford University",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwApKLsSy6RfnsKH35Bd5tAUJmL6a9QE_JNd6vqGqLFXP4xnJxt_hxfKyZgbTBUb-3Bhs0j9uenz9lGl949IpLZOdbtC9ihq-JJdNzBbuIgXt7xXriVQnVyrx_0wlbvMgEa8SHr4kTNT6OdAQO1dkkA5_EB_CnhvMdO2EwWTK0BTCara1OXAs1k-rooCXfiw-OuO2pNOBlH1etZ9JoiGcbricXEwTlDt6wlwZ9bpO8-6H80pUp3qW3qvbk8pvjC-xB2ywMuddIxg",
      height: "h-7 md:h-9",
    },
    {
      name: "MIT",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQNGF3mqYunS1WiQZZp5sNv8IkrW7a1W58ofJMBIygjB3nrcv627K_oZD2LQFUSxlXHrprSrFNQNoopwj3sM8Gk-kAmBOEVPtxqQEJJR98U-DMpPx-MsOkKyJBaMbIhVrOdMtXkSumuo9wY_dhaH4Db61QiNgCUav2if_ymxiIS9Sk9n_gyH2eem2XbZstN5Kr6B92jsq9tN3sYbZxSOpLMMh1WnbLjoTdioRgq0eosYhTpHInue4xnMdhO_X13qG7i62IxmTeMw",
      height: "h-8 md:h-10",
    },
    {
      name: "Oxford University",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuARODAuShoSY_zh62FfnVDgwAWv10YwpkXRKiePqTukEImjqeS6vyyQrD32cYxX6Lllxpf7FGADk7KyoGKPvVWn1Wlm-hHTzG_UiyBGj6af3khFq0rrWRkdTrPDdYTJ4yPPcSbE2SCoBX-_e0ToeNt-HcS8786QNiRF8kdUBIFdEnx8kQ-DzAYYc0QaXrmRL96WampSQ7-NKFYDOIyGcw8UOmKHXU_YpAPXeYq_l1nW95zasfOSQpjUjxqAa35-aKfgxaGZ6elrEg",
      height: "h-8 md:h-10",
    },
    {
      name: "Cambridge University",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmSaVOyw9ByQ4mgKenfpnXFZYsfy1baa0D9CJtOz8555PKuzS3j1_H_RKaEBexKzUF-Fi6BTlEJdAo1W9pd8VeNNaCMlDlfM6v5e_MZYKIBMOKtgOqzGHH5oca61x9EMJN8clLCq7zrgbq720ZYFplxz8IyJ547fvfLKatWK11D8rw5MXktsyG20uKP1eKYW_Si4gxBaxnhS-FR1ZhM-BcRWdGRFPHzCYe8WxrEvpjfzYmw82aBU2bGCL4Z3xh-5lF-yJ92G_tHQ",
      height: "h-8 md:h-10",
    },
    {
      name: "Yale University",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuANSrUAu8XLY9feWPIiyIiGOXH4lrRpEPuw0-WC-QwnQLWFmR8dAAydXVZTCIn08AQtj135d_G0b7Ss3G_1MDNdl7X5lIzxkXKKFrbyPx2eGyv6Tn1BQuKqjD67UL-15I3gY_c3ThtwHnBK1saHG4SfMqthjeWxiyrpMcp_uwJYopnyFNuiH3XPO8_bXA7gy_RpQAu2KoDI428nhGrcNabcPH1cbAId40E57KFfxnDxv-lNoxh7DK600Gx2F6DraMdp3zi11uJeCA",
      height: "h-8 md:h-10",
    },
  ];

  return (
    <section className="w-full py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-20">
        <h4 className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-center mb-10 text-muted-foreground">
          MENTORING STUDENTS FOR TOP UNIVERSITIES
        </h4>
        <div className="relative flex overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:w-16 before:h-full before:bg-gradient-to-r before:from-background before:to-transparent before:z-10 after:content-[''] after:absolute after:right-0 after:top-0 after:w-16 after:h-full after:bg-gradient-to-l after:from-background after:to-transparent after:z-10">
          <div className="flex animate-marquee whitespace-nowrap items-center">
            {logos.map((logo, idx) => (
              <img
                key={`${logo.name}-1-${idx}`}
                className={`${logo.height} mx-10 opacity-60 grayscale hover:grayscale-0 transition-all`}
                alt={`${logo.name} Logo`}
                src={logo.url}
              />
            ))}
          </div>
          <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap items-center">
            {logos.map((logo, idx) => (
              <img
                key={`${logo.name}-2-${idx}`}
                className={`${logo.height} mx-10 opacity-60 grayscale hover:grayscale-0 transition-all`}
                alt={`${logo.name} Logo`}
                src={logo.url}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniversityLogos;
