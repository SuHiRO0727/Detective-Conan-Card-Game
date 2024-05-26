import * as yup from "yup";

// ログイン画面
export const loginSchema = yup.object({
    email: yup.string().required('メールアドレスは必須です').email("メールアドレス形式で入力してください"),
    password: yup.string().required('パスワードは必須です')
}).required();

// 新規登録画面
export const signUpSchema = yup.object({
    username: yup.string().required('ユーザー名は必須です'),
    email: yup.string().required('メールアドレスは必須です').email("メールアドレス形式で入力してください"),
    password: yup.string().required('パスワードは必須です'),
    confirmPassword: yup.string().required('パスワードは必須です')
}).required();