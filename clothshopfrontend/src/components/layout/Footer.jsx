import React from 'react'
import { Box, Container, Grid, Stack, Text, Group, ActionIcon } from '@mantine/core'
// import { Instagram, Twitter, Pinterest } from 'lucide-react'

const Footer = () => {
  return (
    <Box style={(theme) => ({
      backgroundColor: '#1a1a1a',
      color: '#e0e0e0',
      padding: '60px 0 40px',
      marginTop: 'auto',
      borderTop: `1px solid ${theme.colors.dark[5]}`,
    })}>
      <Container size="" px="xl">
        {/* Main Footer Content */}
        <Grid gutter="xl" mb={60}>
          {/* Brand Section */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap="md">
              <Text fw={700} size="xl" style={{ letterSpacing: '2px' }}>
                MAISON
              </Text>
              <Text size="sm" c="#999">
                Premium fashion for the modern lifestyle. Curated collections from around the world.
              </Text>
            </Stack>
          </Grid.Col>

          {/* Shop Section */}
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Stack gap="md">
              <Text fw={600} size="sm">
                Shop
              </Text>
              <Stack gap="xs">
                <Text size="sm" c="#999" style={{ cursor: 'pointer' }} className="footer-link">
                  Women
                </Text>
                <Text size="sm" c="#999" style={{ cursor: 'pointer' }} className="footer-link">
                  Men
                </Text>
                <Text size="sm" c="#999" style={{ cursor: 'pointer' }} className="footer-link">
                  Kids
                </Text>
                <Text size="sm" c="#999" style={{ cursor: 'pointer' }} className="footer-link">
                  Sale
                </Text>
              </Stack>
            </Stack>
          </Grid.Col>

          {/* Help Section */}
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Stack gap="md">
              <Text fw={600} size="sm">
                Help
              </Text>
              <Stack gap="xs">
                <Text size="sm" c="#999" style={{ cursor: 'pointer' }} className="footer-link">
                  Contact Us
                </Text>
                <Text size="sm" c="#999" style={{ cursor: 'pointer' }} className="footer-link">
                  Shipping Info
                </Text>
                <Text size="sm" c="#999" style={{ cursor: 'pointer' }} className="footer-link">
                  Returns
                </Text>
                <Text size="sm" c="#999" style={{ cursor: 'pointer' }} className="footer-link">
                  FAQ
                </Text>
              </Stack>
            </Stack>
          </Grid.Col>

          {/* Connect Section */}
          <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
            <Stack gap="md">
              <Text fw={600} size="sm">
                Connect
              </Text>
              <Group gap="lg">
                {/* <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  radius="50%"
                  sx={{
                    border: '2px solid #666',
                    '&:hover': { borderColor: '#e0e0e0', color: '#e0e0e0' },
                  }}
                >
                  <Instagram size={20} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  radius="50%"
                  sx={{
                    border: '2px solid #666',
                    '&:hover': { borderColor: '#e0e0e0', color: '#e0e0e0' },
                  }}
                >
                  <Twitter size={20} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  radius="50%"
                  sx={{
                    border: '2px solid #666',
                    '&:hover': { borderColor: '#e0e0e0', color: '#e0e0e0' },
                  }}
                >
                  <Pinterest size={20} />
                </ActionIcon> */}
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Bottom Footer */}
        <Box style={{ borderTop: '1px solid #333', paddingTop: '30px' }}>
          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="sm" c="#999">
              2024 MAISON. All rights reserved.
            </Text>
            <Group gap="md">
              <Text
                size="sm"
                c="#999"
                style={{ cursor: 'pointer' }}
                className="footer-link"
              >
                Privacy Policy
              </Text>
              <Text
                size="sm"
                c="#999"
                style={{ cursor: 'pointer' }}
                className="footer-link"
              >
                Terms of Service
              </Text>
            </Group>
          </Group>
        </Box>
      </Container>

      <style>{`
        .footer-link {
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: #e0e0e0;
        }
      `}</style>
    </Box>
  )
}

export default Footer