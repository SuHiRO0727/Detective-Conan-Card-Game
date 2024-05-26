import { useRouter } from 'next/router';
import { createUser } from '@/contexts/AuthContext';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signUpSchema } from '@/utils/validation-schemas';
import { UsersRepository } from '@/repository/users-repository';
import Footer from '@/components/template/footer';
import Header from '@/components/template/header';

interface SignUpProps {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const {register, handleSubmit, formState: { errors }} = useForm<SignUpProps> ({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        resolver: yupResolver(signUpSchema)
    })

    const onSubmit: SubmitHandler<SignUpProps> = async (data) => {
        try {
            const user = await createUser(data.email, data.password);
            await UsersRepository.createUser({
                userId: user.uid,
                username: data.username
            });
            router.push('/login')
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed, please try again.");
        }
    }

    const goToLogin = () => {
        router.push('/login');
    };

    return (
        <>
            <Header />
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-center mb-6">アカウント登録</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                ユーザー名
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="username"
                                type="text"
                                placeholder="ユーザー名"
                                {...register('username')}
                            />
                            {errors.username && <p className="text-red-500 text-xs italic">{errors.username.message}</p>}
                        </div>
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
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                パスワード
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="password"
                                type="password"
                                placeholder="パスワード"
                                {...register('password')}
                            />
                            {errors.password && <p className="text-red-500 text-xs italic">{errors.password.message}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                                パスワード（確認用）
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="confirmPassword"
                                type="password"
                                placeholder="パスワード（確認用）"
                                {...register('confirmPassword')}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-xs italic">{errors.confirmPassword.message}</p>}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="submit"
                            >
                                登録
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="inline-block align-baseline text-sm text-blue-500 hover:text-blue-700"
                                type="button"
                                onClick={goToLogin}
                            >
                                ログイン画面に戻る
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}