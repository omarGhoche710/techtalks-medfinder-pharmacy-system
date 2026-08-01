"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import styles from "../auth.module.css";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

const REMEMBER_KEY = 'medfinder_remembered_email';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  // Pre-fill email if previously remembered
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError('');

    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    try {
      // api call to login
    } catch (err) {
      setError('Invalid email or password');
    }
    router.push(next ?? '/pharmacy/Dashboard');
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <Label className={styles.formLabel} htmlFor="password">Password</Label>
                  <Input
                    className={styles.formInput}
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <FieldGroup className={styles.formCheckboxGroup}>
                  <Field orientation="horizontal">
                    <Checkbox
                      className={styles.formCheckbox}
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                    />
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
            {error && <p className="text-xs text-red-600 w-full">{error}</p>}
            <Button type="submit" className={styles.btnPrimary} onClick={handleLogin}>
              Login
            </Button>
            <CardAction className={styles.authSwitch}>
              <span className={styles.authSwitchText}>Don't have an account?</span>
              <Button className={styles.authSwitchLink} variant="link" onClick={() => router.push('/pharmacy/signup')}>
                Sign Up
              </Button>
            </CardAction>
          </CardFooter>
        </Card>
      </div>
      <div className={styles.imageContainer}>
        <div className={styles.heroContent}>
          <div className={styles.heroLogo}>
            <span className={styles.heroLogoText}>MedFinder</span>
          </div>
          <h2 className={styles.heroTitle}>
            Welcome to <span>MedFinder!</span>
          </h2>
          <p className={styles.heroBody}>
            One website where you can add your pharmacy's medication, manage your stock, and help people find your location increasing your visibility!
          </p>
          <div className={styles.heroDots}>
            <div className={styles.heroDot} />
            <div className={styles.heroDot} />
            <div className={styles.heroDot} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
