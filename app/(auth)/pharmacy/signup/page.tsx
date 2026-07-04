"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
    Map,
    MapTileLayer,
    MapZoomControl,
    MapLocateControl,
    MapSearchControl,
    MapMarker,
    MapFullscreenControl,
} from "@/components/ui/map";
import type { LatLngExpression } from "leaflet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import styles from "../auth.module.css";
import GoogleIcon from '@iconify-react/material-icon-theme/google';
import BaselineAppleIcon from '@iconify-react/ic/baseline-apple';
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

const Signup = () => {
    const [pharmacyName, setPharmacyName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [location, setLocation] = useState<{ lat: number; lng: number; } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async (e: any) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        try {
            setError(null);
            //api push 
        }
        catch (err) {
            setError("Signup failed. Please try again.");
        }
        router.push('/pharmacy/dashboard');
    };

    const handleLocationChange = (lat: number, lng: number) => {
        setLocation({ lat, lng });
    };

    useEffect(() => {
        console.log("LOCATION UPDATED:", location);
    }, [location]);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.registerContainer}>
                <Card>
                    <CardHeader>
                        <CardTitle className={styles.header}>Sign up for your account</CardTitle>
                        <CardDescription className={styles.formDescription}>
                            Enter your details below to create an account
                        </CardDescription>

                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignup} className={styles.formGroup}>
                            <div className={styles.SignupContainer}>
                                <div className={styles.formGroup}>
                                    <Label className={styles.formLabel} htmlFor="pharmacyName">Pharmacy Name</Label>
                                    <Input
                                        className={styles.formInput}
                                        id="pharmacyName"
                                        type="text"
                                        onChange={(e) => setPharmacyName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <Label className={styles.formLabel} htmlFor="email">Email</Label>
                                    <Input
                                        className={styles.formInput}
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <div className="flex items-center">
                                        <Label className={styles.formLabel} htmlFor="password">Password</Label>
                                    </div>
                                    <Input className={styles.formInput} id="password" type="password" onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <div className="flex items-center">
                                        <Label className={styles.formLabel} htmlFor="confirmPassword">Confirm Password</Label>
                                        <a
                                            href="#"
                                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                        />
                                    </div>
                                    <Input className={styles.formInput} id="confirmPassword" type="password" onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                                <div className={styles.locationCard}>
                                    <Map
                                        key={location ? `${location?.lat}-${location?.lng}` : "default"}
                                        className={styles.locationCardMap}
                                        center={
                                            location ?
                                                [location.lat, location.lng]
                                                : [33.8933, 35.5015]}>
                                        <MapZoomControl className={styles.zoomBtn} position="bottomright" />
                                        <MapLocateControl className={styles.locateMeBtn} position="bottomright"
                                            onLocationFound={(e) => handleLocationChange(e.latlng.lat, e.latlng.lng)}
                                        />
                                        <MapSearchControl
                                            className={styles.searchBtn}
                                            position="topleft"
                                            onSelect={(place: any) => {
                                                console.log("Selected place:", place)
                                                if (place.lat && place.lng) {
                                                    handleLocationChange(place.lat, place.lng)
                                                } else if (place.center) {
                                                    handleLocationChange(place.center[1], place.center[0])
                                                } else if (place.geometry?.coordinates) {
                                                    handleLocationChange(place.geometry.coordinates[1], place.geometry.coordinates[0])
                                                }
                                            }}
                                        />
                                        <MapFullscreenControl className={styles.fullBtn} position="topright" />
                                        <MapTileLayer />
                                        {location?.lat !== undefined && location?.lng !== undefined && (
                                            <MapMarker position={[location.lat, location.lng]} />
                                        )}
                                    </Map>
                                </div>
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm mt-2">
                                    {error}
                                </p>
                            )}
                            <Field className={styles.formCheckboxGroup}>
                                <Checkbox className={styles.formCheckbox} />
                                <FieldLabel className={styles.FieldLabel} htmlFor="acceptTerms">
                                    Accept <a href="#" className={styles.termsLink}>Terms and Conditions</a>
                                </FieldLabel>
                            </Field>
                            <CardFooter className={styles.cardFooter}>
                                <Button className={styles.btnPrimary} type="submit">
                                    Sign Up
                                </Button>
                                <div className={styles.socialLoginContainer}>
                                    <Button className={styles.btnSocial} variant="outline">
                                        <GoogleIcon height='18' width='18' />
                                        Sign Up with Google
                                    </Button>
                                    <Button className={styles.btnSocial} variant="outline">
                                        <BaselineAppleIcon height='25' width='25' />
                                        Sign Up with Apple
                                    </Button>
                                </div>
                                <CardAction className={styles.authSwitch}>
                                    <span className={styles.authSwitchText}>Already have an account?</span>
                                    <Button className={styles.authSwitchLink} variant="link" onClick={() => router.push('/pharmacy/login')}>
                                        Log In
                                    </Button>

                                </CardAction>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </div >
            <img>

            </img>
        </div>
    );
};

export default Signup;