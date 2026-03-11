function PrivacyPolicy() {
  return (
    <div className="p-10 bg-[#f4f6f8] min-h-screen">
      <div className="max-w-7xl mx-auto">

        <h2 className="text-xl font-bold mb-8">Integritetspolicy</h2>

        <div className="bg-white p-6 rounded-xl shadow">

          <section className="mb-6">
            <h3 className="font-semibold mt-0">1. Vilken data samlar vi in?</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Vi samlar in följande personuppgifter som du själv anger:
            </p>
            <ul className="text-sm text-gray-500 leading-relaxed">
              <li><strong>Kontoinformation:</strong> E-postadress och lösenord (lagras krypterat med bcrypt)</li>
              <li><strong>CV-uppgifter:</strong> Namn, telefonnummer, e-post, sammanfattning, arbetslivserfarenhet, utbildning och färdigheter</li>
              <li><strong>Jobbansökningar:</strong> Företag, roll, status, datum, källa och anteckningar</li>
              <li><strong>Kontakter:</strong> Namn, e-post, telefon, företag, roll och anteckningar</li>
              <li><strong>Påminnelser:</strong> Titel, beskrivning och tidpunkt</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="font-semibold">2. Varför samlar vi in datan?</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              All data samlas in enbart för att tillhandahålla tjänstens funktionalitet — att hjälpa dig spåra dina jobbansökningar, hantera kontakter, skapa CV och få påminnelser. Vi säljer aldrig din data till tredje part.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="font-semibold">3. Hur skyddar vi din data?</h3>
            <ul className="text-sm text-gray-500 leading-relaxed">
              <li>Lösenord hashas med <strong>bcrypt</strong> — vi lagrar aldrig lösenord i klartext</li>
              <li>Autentisering sker via <strong>JWT-tokens</strong> med 30 minuters giltighetstid</li>
              <li>All kommunikation sker via skyddade API-anrop</li>
              <li>Databasen är skyddad och åtkomlig enbart för applikationen</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="font-semibold">4. Dina rättigheter (GDPR)</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Enligt GDPR har du följande rättigheter:
            </p>
            <ul className="text-sm text-gray-500 leading-relaxed">
              <li><strong>Rätt till tillgång:</strong> Du kan exportera all din data via Kontoinställningar</li>
              <li><strong>Rätt till radering:</strong> Du kan radera ditt konto och all tillhörande data via Kontoinställningar</li>
              <li><strong>Rätt till dataportabilitet:</strong> Din data exporteras i JSON-format som du kan ta med dig</li>
              <li><strong>Rätt till rättelse:</strong> Du kan redigera all din information direkt i applikationen</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="font-semibold">5. E-postpåminnelser</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Om du skapar påminnelser skickas e-post till den adress som är kopplad till ditt konto vid den tidpunkt du valt. Vi använder SMTP via Gmail för att skicka dessa. Du kan när som helst ta bort påminnelser.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">6. Kontakt</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Har du frågor om hur din data hanteras? Kontakta oss så hjälper vi dig.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}

export default PrivacyPolicy;
