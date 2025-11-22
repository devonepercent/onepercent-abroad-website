import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What makes OnePercent Abroad different from other consultancies?",
    answer:
      "OnePercent Abroad focuses on a mentorship-based approach rather than just consulting. We connect you with mentors who have graduated from the world's top 1% universities, providing personalized, experience-based guidance throughout your application journey.",
  },
  {
    question: "Who are the mentors?",
    answer:
      "Our mentors are experienced professionals who have successfully helped hundreds of students with their elite university applications. They bring deep expertise in navigating the rigorous application processes for top institutions worldwide.",
  },
  {
    question: "How does the mentorship process work?",
    answer:
      "Our process begins with a detailed profile evaluation, followed by one-on-one strategy sessions with your mentor. We provide comprehensive support on everything from university selection and essay writing to interview preparation and post-admission logistics.",
  },
  {
    question: "What is your success rate?",
    answer:
      "While admission to top universities is highly competitive, our students have a significantly higher success rate than the average applicant pool due to our personalized strategies and expert guidance. We are proud of the many students we've helped gain admission to their dream universities.",
  },
  {
    question: "How can I get started?",
    answer:
      "The best way to start is by booking a free call with our team. This initial consultation allows us to understand your goals, assess your profile, and determine how we can best support you in your journey to a top university.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="w-full px-4 py-24 sm:px-10 lg:px-20 sm:py-32 bg-background">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center text-3xl sm:text-4xl sm:text-5xl font-bold mb-4">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="mt-12 space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="rounded-xl border border-border bg-card px-6 py-2"
            >
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
