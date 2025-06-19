'use client'

import HeaderProvider from '@/context/HeaderProvider'
import { typeVariant } from '@/lib/postgres/data/type'
import { typeProductTypes, typeShipping } from '@/utils/getPostgres'

type PrivacyPolicyPageClientProps = {
  product_types: typeProductTypes
  all_variants: typeVariant[]
  shipping: typeShipping
}

export function PrivacyPolicyPageClient({
  product_types,
  all_variants,
  shipping,
}: PrivacyPolicyPageClientProps) {
  return (
    <HeaderProvider
      product_types={product_types}
      all_variants={all_variants}
      shipping={shipping}
    >
      <main className="flex-1 container mx-auto px-6 py-12 text-black">
        <p className="text-sm text-gray-600 mb-6">
          Τελευταία ενημέρωση: 14 Απρίλιος 2025
        </p>

        <section className="mb-8">
          <p>
            Η παρούσα Πολιτική Απορρήτου περιγράφει τον τρόπο με τον οποίο το
            MotoWearClothing (ο «Ιστότοπος», «εμείς», «εμάς» ή «μας») συλλέγει,
            χρησιμοποιεί και αποκαλύπτει τις προσωπικές σας πληροφορίες όταν
            επισκέπτεστε, χρησιμοποιείτε τις υπηρεσίες μας ή πραγματοποιείτε
            κάποια αγορά από www.motowear.gr (ο «Ιστότοπος») ή επικοινωνείτε
            άλλως μαζί μας σχετικά με τον Ιστότοπο (συλλογικά, οι «Υπηρεσίες»).
            Για τους σκοπούς της παρούσας Πολιτικής Απορρήτου, οι όροι «εσείς»
            και «σας» αναφέρονται σε εσάς ως χρήστη των Υπηρεσιών, είτε είστε
            πελάτης, επισκέπτης στον ιστότοπο ή άλλο άτομο του οποίου τις
            πληροφορίες έχουμε συλλέξει σύμφωνα με την παρούσα Πολιτική
            Απορρήτου.
          </p>
          <p>Διαβάστε προσεκτικά την παρούσα Πολιτική Απορρήτου.</p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="updates" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Αλλαγές στην Πολιτική Απορρήτου
          </h2>
          <p>
            Ενδέχεται να ενημερώνουμε την παρούσα Πολιτική Απορρήτου κατά
            καιρούς, μεταξύ άλλων προκειμένου να αντικατοπτρίζουμε αλλαγές στις
            πρακτικές μας ή για άλλους επιχειρησιακούς, νομικούς ή κανονιστικούς
            λόγους. Θα δημοσιεύσουμε την αναθεωρημένη Πολιτική Απορρήτου στον
            Ιστότοπο, θα ενημερώσουμε την ημερομηνία «Τελευταία ενημέρωση» και
            θα λάβουμε οποιαδήποτε άλλα μέτρα απαιτούνται από την ισχύουσα
            νομοθεσία.
          </p>
        </section>

        <hr className="border-t-2 border-gray-300 my-10" />

        <section id="collection-usage" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Πώς συλλέγουμε και χρησιμοποιούμε τις πληροφορίες σας
          </h2>
          <p>
            Για την παροχή των Υπηρεσιών, συλλέγουμε προσωπικές πληροφορίες για
            εσάς από διάφορες πηγές, όπως αναφέρονται παρακάτω. Οι πληροφορίες
            που συλλέγουμε και χρησιμοποιούμε διαφέρουν ανάλογα με τον τρόπο που
            αλληλεπιδράτε μαζί μας.
          </p>
          <p>
            Εκτός από τις συγκεκριμένες χρήσεις που αναφέρονται παρακάτω,
            ενδέχεται να χρησιμοποιήσουμε τις πληροφορίες που συλλέγουμε για
            εσάς προκειμένου να επικοινωνήσουμε μαζί σας, να παρέχουμε ή να
            βελτιώσουμε τις Υπηρεσίες, να συμμορφωθούμε με τυχόν νομικές
            υποχρεώσεις, να επιβάλλουμε όρους και να προστατεύσουμε τα
            δικαιώματά μας.
          </p>
        </section>

        <section id="direct-info" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">
            Πληροφορίες που συλλέγουμε απευθείας από εσάς
          </h3>
          <ul className="list-disc list-inside mb-4">
            <li>
              <strong>Στοιχεία επικοινωνίας:</strong> όνομα, διεύθυνση,
              τηλέφωνο, email.
            </li>
            <li>
              <strong>Πληροφορίες παραγγελίας:</strong> διευθύνσεις, επιβεβαίωση
              πληρωμής, email, τηλέφωνο.
            </li>
            <li>
              <strong>Πληροφορίες λογαριασμού:</strong> username, password,
              ερωτήσεις ασφαλείας.
            </li>
            <li>
              <strong>Υποστήριξη πελατών:</strong> δεδομένα επικοινωνίας μέσω
              των Υπηρεσιών.
            </li>
          </ul>
        </section>

        <section id="usage-info" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Πληροφορίες χρήσης</h3>
          <p>
            Μπορεί επίσης να συλλέξουμε αυτόματα ορισμένες πληροφορίες σχετικά
            με την αλληλεπίδρασή σας με τις Υπηρεσίες (“Δεδομένα Χρήσης”),
            χρησιμοποιώντας cookie, pixel και άλλες τεχνολογίες.
          </p>
        </section>

        <section id="third-party-info" className="mb-8">
          <h3 className="text-xl font-semibold mb-3">
            Πληροφορίες από τρίτα μέρη
          </h3>
          <ul className="list-disc list-inside mb-4">
            <li>
              Προμηθευτές και πάροχοι υπηρεσιών (Shopify, πληρωμές, analytics).
            </li>
            <li>Πελάτες που αλληλεπιδρούν μέσω email ή social media.</li>
            <li>Τεχνολογίες παρακολούθησης (web beacons, SDKs, cookie).</li>
          </ul>
        </section>
      </main>
    </HeaderProvider>
  )
}
