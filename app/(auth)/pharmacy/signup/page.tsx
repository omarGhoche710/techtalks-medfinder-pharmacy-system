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
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import styles from "../auth.module.css";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { setSignupLocation } from "@/lib/signupLocation";

const Signup = () => {
    const [pharmacyName, setPharmacyName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [location, setLocation] = useState<{ lat: number; lng: number; } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const router = useRouter();


    const handleSubmitClick = (e: any) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!location) {
            setError("Please select your pharmacy location on the map");
            return;
        }
        setConfirmOpen(true);
    };

    const handleLocationChange = (lat: number, lng: number) => {
        setLocation({ lat, lng });
    };

    const handleConfirmSignup = async () => {
        if (!location) return;
        try {
            setSignupLocation(location); // persist for other files to read
            //api push
        } catch (err) {
            setError("Signup failed. Please try again.");
            setConfirmOpen(false);
            return;
        }
        setConfirmOpen(false);
        router.push('/pharmacy/Dashboard');
    };


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
                        <form onSubmit={handleSubmitClick} className={styles.formGroup}>
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
                                    </div>
                                    <Input className={styles.formInput} id="confirmPassword" type="password" onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                                <div className={styles.locationCard}>
                                    <Map
                                        key={location ? `${location?.lat}-${location?.lng}` : "default"}
                                        className={styles.locationCardMap}
                                        center={location ? [location.lat, location.lng] : [33.8933, 35.5015]}>
                                        <MapZoomControl className={styles.zoomBtn} position="bottom-1 right-1" />
                                        <MapLocateControl className={styles.locateMeBtn} position="bottom-1 left-1"
                                            onLocationFound={(e) => handleLocationChange(e.latlng.lat, e.latlng.lng)}
                                        />
                                        <MapSearchControl
                                            className={styles.searchBtn}
                                            position="top-1 left-1"
                                            onPlaceSelect={(feature) => {
                                                const [lon, lat] = feature.geometry.coordinates
                                                handleLocationChange(lat, lon)
                                            }}
                                        />
                                        <MapFullscreenControl className={styles.fullBtn} position="top-1 right-1" />
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
                            <Field orientation="horizontal" className={styles.formCheckboxGroup}>
                                <Checkbox className={styles.formCheckbox} />
                                <FieldLabel className={styles.FieldLabel} htmlFor="acceptTerms">
                                    Accept <a href="#" className={styles.termsLink}>Terms and Conditions</a>
                                </FieldLabel>
                            </Field>
                            <CardFooter className={styles.cardFooter}>
                                <Button className={styles.btnPrimary} type="submit">
                                    Sign Up
                                </Button>

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

            {/* Confirmation dialog — recaps the last selected location before final submit */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Confirm pharmacy location</DialogTitle>
                        <DialogDescription>
                            Is this the correct location for your pharmacy? You can go back and adjust the pin if not.
                        </DialogDescription>
                    </DialogHeader>
                    {location && (
                        <div className="rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] p-3 text-sm text-[#111827] font-mono">
                            Lat: {location.lat.toFixed(6)}<br />
                            Lng: {location.lng.toFixed(6)}
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Change location</Button>
                        </DialogClose>
                        <Button className={styles.btnPrimary} onClick={handleConfirmSignup}>
                            Confirm & Sign Up
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
export default Signup;