import classes from '@/components/css/FooterCentered.module.css'
import { ActionIcon, Anchor, Group } from '@mantine/core'
import { MdOutlineEmail } from 'react-icons/md'
import { FaPhoneAlt } from 'react-icons/fa'
import { FaInstagram } from 'react-icons/fa'
import { FaFacebookSquare } from 'react-icons/fa'

const links = [
  { link: '#', label: 'Contact' },
  { link: '#', label: 'Privacy' },
  { link: '#', label: 'Blog' },
  { link: '#', label: 'Store' },
  { link: '#', label: 'Careers' },
]

export function Footer() {
  const items = links.map(link => (
    <Anchor c="dimmed" key={link.label} href={link.link} lh={1} size="sm">
      {link.label}
    </Anchor>
  ))

  return (
    <div className={classes.footer}>
      <div className={classes.inner}>
        {/* <MantineLogo size={28} /> */}

        <Group className={classes.links}>{items}</Group>

        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" variant="default" radius="xl">
            <MdOutlineEmail size={18} />
          </ActionIcon>
          <ActionIcon size="lg" variant="default" radius="xl">
            <FaPhoneAlt size={18} />
          </ActionIcon>
          <ActionIcon size="lg" variant="default" radius="xl">
            <FaInstagram size={18} />
          </ActionIcon>
          <ActionIcon size="lg" variant="default" radius="xl">
            <FaFacebookSquare size={18} />
          </ActionIcon>
        </Group>
      </div>
    </div>
  )
}
