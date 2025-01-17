'use client'

import React, { useState, useRef } from 'react';
import Link from 'next/link';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import PopUpError from '../PopUps/Error';
import LoadingSpinner from '../Loading/LoadingSpinner';

import ReCAPTCHA from 'react-google-recaptcha';

interface SignInData {
    email: string;
    password: string;
}

export default function SignInForm() {
    const [showPassword, setShowPassword] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<SignInData>();
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setShowPassword(prev => !prev);
    };

    const handleSignIn: SubmitHandler<SignInData> = async (data) => {
        try {
            setIsSubmitting(true);

            const recaptchaToken = await recaptchaRef.current?.executeAsync();
            recaptchaRef.current?.reset();

            if (!recaptchaToken) {
                setError('Falha na verificação de segurança. Por favor, tente novamente.');
                return;
            }

            const response = await signIn('user-login', {
                ...data,
                recaptchaToken,
                redirect: false
            });

            if (response?.error) {
                setError(response.error);
                return;
            }

            router.replace('/user/home');
        } catch (err) {
            setError('Falha ao entrar. Por favor, tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden z-20">
            <BackgroundEffects />
            <FormContainer>
                <FormHeader />
                <form onSubmit={handleSubmit(handleSignIn)} className="space-y-6">
                    <EmailField register={register} errors={errors} />
                    <PasswordField 
                        register={register} 
                        errors={errors}
                        showPassword={showPassword}
                        togglePasswordVisibility={togglePasswordVisibility}
                    />
                    <SubmitButton isSubmitting={isSubmitting} />
                    <ReCaptchaField recaptchaRef={recaptchaRef} />
                    <SignUpLink />
                </form>
            </FormContainer>
            {error && <PopUpError message={error} onClose={() => setError('')} />}
        </div>
    );
}

const BackgroundEffects = () => (
    <>
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-[#00A3FF]/20 rounded-full blur-[128px]"></div>
    </>
);

const FormContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-md p-4 relative">
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-800 p-8 space-y-6">
            {children}
        </div>
    </div>
);

const FormHeader = () => (
    <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#00A3FF] bg-clip-text text-transparent">
            Bem-vindo de Volta
        </h1>
        <p className="text-gray-400">Entre para gerenciar seus boletos</p>
    </div>
);

const EmailField = ({ register, errors }: { register: any, errors: any }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
        </label>
        <input
            {...register("email", {
                required: 'Email é obrigatório',
                pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                }
            })}
            className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-black placeholder-gray-400 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
            placeholder="seu@email.com"
        />
        {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
        )}
    </div>
);

const PasswordField = ({ 
    register, 
    errors, 
    showPassword, 
    togglePasswordVisibility 
}: { 
    register: any, 
    errors: any, 
    showPassword: boolean,
    togglePasswordVisibility: (e: React.MouseEvent<HTMLButtonElement>) => void
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
            Senha
        </label>
        <div className="relative">
            <input
                {...register("password", { required: 'Senha é obrigatória' })}
                type={showPassword ? "password" : "text"}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-black placeholder-gray-400 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
                placeholder="••••••••"
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-black hover:text-black transition-colors"
            >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
        </div>
        {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
        )}
    </div>
);

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => (
    <div className="relative">
        <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-xl text-white font-medium bg-gradient-to-r from-[#8B5CF6] to-[#00A3FF] 
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02]'} 
                transition-all duration-200 flex items-center justify-center`}
        >
            {isSubmitting ? <LoadingSpinner /> : 'Entrar'}
        </button>
    </div>
);

const ReCaptchaField = ({ recaptchaRef }: { recaptchaRef: React.RefObject<ReCAPTCHA> }) => (
    <ReCAPTCHA
        ref={recaptchaRef}
        size="invisible"
        sitekey={String(process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY)}
        className="invisible"
    />
);

const SignUpLink = () => (
    <p className="text-center text-sm text-gray-400">
        Não tem uma conta?{' '}
        <Link href="/sign-up" className="text-[#8B5CF6] hover:text-[#00A3FF] transition-colors font-medium">
            Criar conta
        </Link>
    </p>
);
