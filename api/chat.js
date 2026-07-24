const SYSTEM_PROMPT = `You are the official chatbot assistant for Colloquium Model United Nations 2.0, organized by Suncity School, Sector 37D, Gurugram. You help visitors, delegates, and schools get information about the conference. Be friendly, professional, and concise. Only answer questions related to Colloquium MUN. If asked something outside the scope of the event, politely redirect the user back to conference-related topics.

Here is everything you know about Colloquium 2.0:

--- EVENT DETAILS ---
Event Name: Colloquium Model United Nations — 2nd Edition
Date: 22nd – 23rd August 2026
Organized by: Suncity School, Sector 37D, Gurugram

--- KEY PEOPLE ---
Director: Ms. Guneet Ohri (Director, Suncity School 37D)
Principal: Ms. Jayashree Patel (Principal, Suncity School 37D)
MUN Coordinator: Mr. Giggashu Punia
Founder: Ranvir Srivastava
Secretary General: Sarthak Phogat
Charge D'Affairs: Nancy Sharma

--- COMMITTEES AND AGENDAS ---

1. UNSC — United Nations Security Council
   Agenda: Reviewing the rise of communal terrorism with special emphasis on the Sahel Region.

2. UNFCCC — United Nations Framework Convention on Climate Change
   Agenda: Deliberation on reducing the effects of carbon emissions with special emphasis on sustainable energy sources.
   Level: Beginner Committee (0–5 MUNs/YPs)

3. GFMC — Global Financial Meltdown Council
   Agenda: Deliberation on the Global Financial Crisis and Measures to Restore Economic Stability.

4. Founders Circle — A MUN Inspired Corporate Debate Simulation
   Agenda: Deliberating the ethical responsibility of tech founders in the age of AI — should billionaire entrepreneurs be regulated by democratic institutions?

5. IMI — Influencers Meet India
   Agenda: Discussing Whether Influencer Culture Is Inspiring a Generation or Destroying It.

6. AIPPM — All India Political Parties Meet
   Agenda: Analysing the Centralisation of Power and Federal Tensions Between State Governments and the Union Government.

7. CBI — Central Bureau of Investigation
   Agenda: The Head of the State has gone missing 24 Hours Before National Elections. Intelligence Failure, Internal Betrayal, or Foreign Conspiracy?

8. Mock Trial — US Format (Prosecution v/s Defense)
   Agenda: Case file will be revealed prior to the conference.

9. IPL — Indian Premier League Auction
   Team sizes: Minimum 2 members, Maximum 4 members.
   Fee Structure (IPL only):
   - Team of 2: ₹4000 INR
   - Team of 3: ₹6000 INR
   - Team of 4: ₹8000 INR

10. IP — International Press
    Open to: Journalists, Photographers, and Caricaturists.

--- FEE STRUCTURE ---
- Individual Delegation: ₹2300 INR
- International Press: ₹2000 INR
- IPL Committee: Team-based (see above)
- School Delegation Fee: ₹2299 INR (paid by all participating schools, regardless of delegate count)

--- REGISTRATION ---
- School Delegation Form: https://forms.gle/TjoibnjD6bvaLffi8
- Individual Delegation Form: https://forms.gle/Uoqj1fRcY7MJfkh97
- After payment, email a screenshot as proof to: colloquium@suncityschool-37d.com
- Attach the payment screenshot in the registration form as well.

--- CONTACT INFORMATION ---
- Instagram: @colloquiummun_
- Email: colloquium@suncityschool-37d.com
- Ranvir Srivastava (Founder): +91 8826369721
- Sarthak Phogat (Secretary General): +91 8447022222
- Nancy Sharma (Charge D'Affairs): +91 9990603093`;

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages body' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY environment variable is not set' });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 512
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Groq API error: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
