"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PharmacyIllustration } from "@/components/PharmacyIllustration";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GoogleIcon from '@iconify-react/material-icon-theme/google';
import BaselineAppleIcon from '@iconify-react/ic/baseline-apple';
import styles from "../auth.module.css";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError('');

    try {
      //api call to login
    } catch (err) {
      setError('Invalid email or password');
    }
    router.push('/pharmacy/Dashboard');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.registerContainer}>
        <Card>
          <CardHeader>
            <CardTitle className={styles.header}>Login to your account</CardTitle>
            <CardDescription className={styles.formDescription}>
              Enter your email below to login to your account
            </CardDescription>

          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className={styles.formGroup}>
              <div className={styles.loginContainer}>
                <div className={styles.formGroup}>
                  <Label className={styles.formLabel} htmlFor="email">Email</Label>
                  <Input
                    className={styles.formInput}
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <div className="flex items-center">
                    <Label className={styles.formLabel} htmlFor="password">Password</Label>
                  </div>
                  <Input className={styles.formInput} id="password" type="password" required />
                </div>
                <FieldGroup className={styles.formCheckboxGroup}>
                  <Field orientation="horizontal">
                    <Checkbox className={styles.formCheckbox} />
                    <FieldLabel className={styles.FieldLabel} htmlFor="remember">
                      Remember me
                    </FieldLabel>
                  </Field>
                  <a href="#" className={styles.forgotPasswordLink}>
                    Forgot your password?
                  </a>
                </FieldGroup>
              </div>
            </form>
          </CardContent>
          <CardFooter className={styles.cardFooter}>
            <Button type="submit" className={styles.btnPrimary}>
              Login
            </Button>
            <div className={styles.divider}>
              <span>or</span>
            </div>
            <div className={styles.socialLoginContainer}>
              <Button className={styles.btnSocial} variant="outline">
                <GoogleIcon height='25' width='25' />
                Login with Google
              </Button>
              <Button className={styles.btnSocial} variant="outline">
                <BaselineAppleIcon height='25' width='25' />
                Login with Apple
              </Button>
            </div>
            <CardAction className={styles.authSwitch}>
              <span className={styles.authSwitchText}>Already have an account?</span>
              <Button className={styles.authSwitchLink} variant="link" onClick={() => router.push('/pharmacy/signup')}>
                Sign Up
              </Button>
            </CardAction>
          </CardFooter>

        </Card>
      </div>
      <div className={styles.imageContainer}>
        <div className={styles.imageContainer}>
          <PharmacyIllustration className={styles.authIllustration} />
        </div>
      </div>

    </div>
  );
};

export default LoginPage;