import { useRouter } from 'next/router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@/utils/validation-schemas';
import { login } from '@/contexts/AuthContext';
import Header from '@/components/template/header';
import Footer from '@/components/template/footer';

interface LoginProps {
    email: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const {register, handleSubmit, formState: { errors }} = useForm<LoginProps> ({
        defaultValues: {
            email: '',
            password: ''
        },
        resolver: yupResolver(loginSchema)
    });

    const onSubmit: SubmitHandler<LoginProps> = async (data) => {
        try {
            await login (data.email, data.password);
            router.push('/top')
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed, please try again.");
        }
    }

    const goToSignup = () => {
        router.push('/signup');
    };

    const goToForgotPassword = () => {
        router.push('/forgot-password');
    };

    return (
        <>
            <Header />
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-center mb-6">ログイン</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                メールアドレス
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="email"
                                type="email"
                                placeholder="メールアドレス"
                                {...register('email')}
                            />
                            {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                パスワード
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                id="password"
                                type="password"
                                placeholder="パスワード"
                                {...register('password')}
                            />
                            {errors.password && <p className="text-red-500 text-xs italic">{errors.password.message}</p>}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >
                                ログイン
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="inline-block align-baseline text-sm text-blue-500 hover:text-blue-700"
                                type="button"
                                onClick={goToForgotPassword}
                            >
                                パスワードを忘れた方へ
                            </button>
                            <button
                                className="inline-block align-baseline text-sm text-blue-500 hover:text-blue-700"
                                type="button"
                                onClick={goToSignup}
                            >
                                新規会員登録へ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}