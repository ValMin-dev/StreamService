import { NewPasswordInput } from '@/src/modules/auth/password-recovery/inputs/new-password.input'
import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator'

// Валідація перевіряє, що пароль і підтвердження пароля збігаються при створенні нового пароля.
@ValidatorConstraint({ name: 'isPasswordMatching', async: false })
export class IsPasswordMatchingConstraint implements ValidatorConstraintInterface {
	validate(password: string, args: ValidationArguments): boolean {
		const object = args.object as NewPasswordInput
		return object.password === object.confirmPassword
	}

	defaultMessage(args: ValidationArguments): string {
		return 'Пароль і підтвердження пароля не збігаються'
	}
}
