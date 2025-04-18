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
  const items = links.map(link => (
    <Anchor c="dimmed" key={link.label} href={link.link} lh={1} size="sm">
      {link.label}
    </Anchor>
  ))

  return (
    <footer className={`p-2 ${classes.footer}`}>
      <div className={classes.inner}>
        <Link href={ROUTE_HOME}>
          <Image
            src="/motowear.png"
            alt="Motowear logo"
            width={200}
            height={100}
          />
        </Link>

        <Group className={classes.links}>{items}</Group>

        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <ActionIcon
            component="a"
            href="mailto:motoweargr@gmail.com"
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
        </Group>
      </div>
    </footer>
  )
}
