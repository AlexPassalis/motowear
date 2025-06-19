import classes from '@/css/FooterCentered.module.css'
import { ActionIcon, Anchor, Group } from '@mantine/core'
import { MdOutlineEmail } from 'react-icons/md'
import { FaPhoneAlt } from 'react-icons/fa'
import { FaInstagram } from 'react-icons/fa'
import { FaFacebookSquare } from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTE_HOME } from '@/data/routes'

const links = [
  { link: '/contact', label: 'Στοιχεία Επικοινωνίας' },
  { link: '/privacy_policy', label: 'Πολιτική Απορρήτου' },
  { link: '/return_policy', label: 'Πολιτική Επιστροφών' },
  { link: '/shipping_policy', label: 'Πολιτική Μεταφορικών' },
  { link: '/terms_of_service', label: 'Όροι & Προϋποθέσεις' },
]

export function Footer() {
  const items = links.map((link) => (
    <Anchor c="dimmed" key={link.label} href={link.link} lh={1} size="xs">
      {link.label}
    </Anchor>
  ))

  return (
    <footer className={`p-2 ${classes.footer}`}>
      <div className={classes.inner}>
        <Link href={ROUTE_HOME}>
          <Image
            src="/motowear.png"
            alt="motowear.gr"
            width={200}
            height={100}
          />
        </Link>

        <Group
          className={classes.links}
          classNames={{ root: '!flex !justify-center !mx-2' }}
        >
          {items}
        </Group>

        <Group
          justify="flex-end"
          wrap="nowrap"
          classNames={{ root: '!flex !flex-col' }}
        >
          <div className="flex gap-2">
            <ActionIcon
              component="a"
              href="mailto:contact@motowear.gr"
              size="lg"
              variant="default"
              radius="xl"
            >
              <MdOutlineEmail size={18} />
            </ActionIcon>
            <ActionIcon
              component="a"
              href="tel:+306939133385"
              size="lg"
              variant="default"
              radius="xl"
            >
              <FaPhoneAlt size={18} />
            </ActionIcon>
            <ActionIcon
              component="a"
              href="https://instagram.com/motowear.gr"
              size="lg"
              variant="default"
              radius="xl"
            >
              <FaInstagram size={18} />
            </ActionIcon>
            <ActionIcon
              component="a"
              href="https://www.facebook.com/p/Moto-Wear-GR-100087815463903/"
              size="lg"
              variant="default"
              radius="xl"
            >
              <FaFacebookSquare size={18} />
            </ActionIcon>
          </div>
          <Link
            href="https://alexpassalis.dev/bio"
            className="text-xs text-red-600 hover:underline"
          >
            Developed by Alex Passalis
          </Link>
        </Group>
      </div>
    </footer>
  )
}
