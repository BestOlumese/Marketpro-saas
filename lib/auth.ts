import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { organization } from 'better-auth/plugins'
import { ac, orgRoles } from '@/lib/auth-ac'
import { db } from '@/lib/db'
import {
  user,
  session,
  account,
  verification,
  organization as orgTable,
  member,
  invitation,
} from '@/lib/db/schema/auth'
import { APP_NAME } from '@/lib/constants/copy'
import { logger } from '@/lib/logger'
import { sendMail } from '@/lib/mail'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
      organization: orgTable,
      member,
      invitation,
    },
  }),
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user: u, url }) => {
      try {
        await sendMail({
          to: u.email,
          subject: `Verify your ${APP_NAME} account`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="color:#1D9E75">Welcome to ${APP_NAME}</h2>
              <p>Click the button below to verify your email address and activate your account.</p>
              <a href="${url}" style="display:inline-block;background:#1D9E75;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0">
                Verify email
              </a>
              <p style="color:#71717a;font-size:14px">This link expires in 24 hours. If you did not sign up for ${APP_NAME}, you can ignore this email.</p>
            </div>
          `,
        })
      } catch (err) {
        logger.error('Failed to send verification email', err)
      }
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    organization({
      ac,
      roles: orgRoles,
      allowUserToCreateOrganization: true,
      async sendInvitationEmail(data) {
        const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/accept-invitation?id=${data.id}`

        // Always log so the link is accessible in server logs if email fails
        logger.info('Invitation URL', { acceptUrl, to: data.email })

        try {
          await sendMail({
            to: data.email,
            subject: `${data.inviter.user.name} invited you to join ${data.organization.name} on ${APP_NAME}`,
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
                <h2 style="color:#1D9E75">${APP_NAME}</h2>
                <p><strong>${data.inviter.user.name}</strong> has invited you to join <strong>${data.organization.name}</strong>.</p>
                <a href="${acceptUrl}" style="display:inline-block;background:#1D9E75;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0">
                  Accept invitation
                </a>
                <p style="color:#71717a;font-size:14px">This link expires in 48 hours. If you were not expecting this invitation you can ignore it.</p>
              </div>
            `,
          })
        } catch (err) {
          logger.error('Failed to send invitation email', err)
        }
      },
    }),
  ],
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ],
})

export type Session = typeof auth.$Infer.Session
export type AuthUser = typeof auth.$Infer.Session.user
