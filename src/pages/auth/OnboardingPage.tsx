import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth, db } from '../../lib/firebase';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';

const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  city: z.string().min(2, 'City is required'),
  area: z.string().min(2, 'Area is required'),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

export function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      city: 'Kolkata' // Default per spec
    }
  });

  const onSubmit = async (data: OnboardingData) => {
    const user = auth.currentUser;
    if (!user) {
      setError('No authenticated user found. Please login again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add a 10-second timeout to the Firestore write
      const savePromise = setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: data.name,
        phone: user.phoneNumber || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        city: data.city,
        area: data.area,
        role: 'user',
        totalKgRecycled: 0,
        totalCredits: 0,
        createdAt: serverTimestamp(),
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please check if Firestore is enabled in your Firebase Console.')), 10000)
      );

      await Promise.race([savePromise, timeoutPromise]);

      // Force reload layout or navigate
      navigate(ROUTES.USER.DASHBOARD, { replace: true });
      window.location.reload();
    } catch (err: any) {
      console.error('Onboarding Error:', err);
      if (err.code === 'permission-denied') {
        setError('Permission Denied: Please ensure Firestore Rules are deployed.');
      } else if (err.message?.includes('timed out')) {
        setError(err.message);
      } else {
        setError('Failed to save profile. Check your internet or Firebase Console.');
      }
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>We need a few details to set up your recycling account.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register('name')} />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Kolkata" {...register('city')} />
              {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Local Area / Locality</Label>
              <Input id="area" placeholder="Salt Lake" {...register('area')} />
              {errors.area && <p className="text-red-500 text-xs">{errors.area.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
