'use client'

import HeaderProvider from '@/context/HeaderProvider'
import { envClient } from '@/envClient'
import { typeProductTypes, typeShipping } from '@/utils/getPostgres'

type ReturnPolicyPageClientProps = {
  product_types: typeProductTypes
  shipping: typeShipping
}

export function ReturnPolicyPageClient({
  product_types,
  shipping,
}: ReturnPolicyPageClientProps) {
  return (
    <HeaderProvider product_types={product_types} shipping={shipping}>
      <main className="flex-1 container mx-auto px-6 py-12 text-black">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          ΠΟΛΙΤΙΚΗ ΕΠΙΣΤΡΟΦΩΝ & ΑΛΛΑΓΩΝ
        </h1>

        <section className="mt-8">
          <p className="mb-4">
            Δεχόμαστε Εντελώς Δωρεάν επιστροφές/αλλαγές εντός{' '}
            <strong>30 ημερών</strong> για αλλαγή μεγέθων και ελατωματικά
            προϊόντα.
          </p>

          <p className="mb-4">
            Διαφορετικά για αλλαγή προϊόντος ή λάθος παραγγελίας του πελάτη, ο
            πελάτης θα πρέπει να χρεωθεί τα{' '}
            <span className="underline">μεταφορικά έξοδα</span> της επιστροφής
            και αποστολής του νέου προϊόντος.
          </p>

          <p className="mb-4">
            Εάν το προϊόν είναι εξατομικευμένο (π.χ. με custom σχέδιο) τότε ο
            πελάτης θα πρέπει να χρεωθεί τα{' '}
            <span className="underline">μεταφορικά έξοδα</span> της επιστροφής
            και αποστολής του νέου προϊόντος.
          </p>

          <p className="mb-4">
            Για λάθος παραγγελίες εκ μέρους του πελάτη ή αλλαγή για άλλο προϊόν,
            ο πελάτης θα πρέπει να χρεωθεί τα{' '}
            <span className="underline">μεταφορικά έξοδα</span> της επιστροφής
            και αποστολής του νέου προϊόντος.
          </p>

          <p className="mb-4">
            Διαδικασία επιστροφής/αλλαγής: Ο πελάτης θα πρέπει να δώσει το δέμα
            στην κούριερ από την οποία το παρέλαβε, δίνοντας τα στοιχεία μας που
            αναγράφονται στο voucher που βρίσκεται στη σακούλα κούριερ που
            παρέλαβε ή να μας ζητήσει τα στοιχεία διεύθυνσης, λέγοντας στην
            κούριερ ότι θέλει να το επιστρέψει με χρέωση παραλήπτη ή χρέωση
            αποστολέα (αναλόγως την περίπτωση).
          </p>

          <p className="mb-4">
            Έπειτα να ζητήσει τον αριθμό αποστολής και να μας τον στείλει σε ένα
            από τα παρακάτω μέσα επικοινωνίας, μαζί με το ονοματεπώνυμο που
            έγινε η παραγγελία και το αν θέλει αλλαγή ή επιστροφή. Με το που
            παραλάβουμε το δέμα θα γίνει αμέσως η αλλαγή/επιστροφή.
          </p>

          <p className="mb-4">
            Για περισσότερες πληροφορίες παρακαλούμε επικοινωνήστε μαζί μας μέσω
            email{' '}
            <a
              href="mailto:contact@motowear.gr"
              className="text-red-600 hover:underline"
            >
              contact@motowear.gr
            </a>{' '}
            ή και τηλεφωνικώς{' '}
            <a
              href={`tel:+30${envClient.MOTOWEAR_PHONE_NUMBER}`}
              className="text-red-600 hover:underline"
            >
              {envClient.MOTOWEAR_PHONE_NUMBER}
            </a>
            .
          </p>
        </section>
      </main>
    </HeaderProvider>
  )
}
