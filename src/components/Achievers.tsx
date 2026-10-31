const achievers = [
  { name: "Anjima Divakar",    program: "EMMIR, Erasmus Mundus",                                                              image: "/images/achievers/Anjima Divakar.png",    initials: "AD" },
  { name: "Ahmed Shoeb",       program: "MPH Scholarship, Johns Hopkins Bloomberg School of Public Health, USA",               image: "/images/achievers/Ahmed Shoeb.png",       initials: "AS" },
  { name: "Ashik Safar",       program: "Nuclear Physics Fully Funded Internship, PRISMA+, Johannes Gutenberg University Mainz",image: "/images/achievers/Ashik Safar.png",      initials: "AS" },
  { name: "Aaqil Rayyan",      program: "Laurea Magistrale in Computer Science, University of Pisa, Italy",                    image: "/images/achievers/Aaqil Rayyan.png",      initials: "AR" },
  { name: "Adnan",             program: "Masters in Management, University of Glasgow",                                        image: "/images/achievers/Adnan.png",             initials: "AD" },
  { name: "Fathima Lamshana",  program: "IMBRSea · International Masters in Marine Biological Resources, Erasmus Mundus",     image: "/images/achievers/Fathima Lamshana.png",  initials: "FL" },
  { name: "Yakkoob Yussef",    program: "InnoEnergy Masters+ Programme, KU Leuven, Belgium",                                  image: "/images/achievers/Yakkoob Yussef.png",    initials: "YY" },
  { name: "Archana",           program: "ACES Star Program, Scholarship worth 15 Lakhs",                                      image: "/images/achievers/Archana.png",           initials: "AC" },
];

const AchieverCard = ({ a }: { a: typeof achievers[0] }) => (
  <div className="ach-card">
    <div className="ach-photo">
      <img src={a.image} alt={a.name} onError={e => { e.currentTarget.style.display = "none"; }} />
    </div>
    <div className="ach-info">
      <b>{a.name}</b>
      <span>{a.program}</span>
    </div>
  </div>
);

const Achievers = () => (
  <section className="achievers" id="achievers">
    <div className="op-shell section-head">
      <div className="op-eyebrow">Our achievers</div>
      <h2>More students, more outcomes.</h2>
    </div>
    <div className="ach-track">
      {[...achievers, ...achievers].map((a, i) => (
        <AchieverCard key={i} a={a} />
      ))}
    </div>
  </section>
);

export default Achievers;
