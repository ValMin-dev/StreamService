import { NewPasswordInput } from '@/src/modules/auth/password-recovery/inputs/new-password.input'
import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator'

@ValidatorConstraint({ name: 'isPasswordMatching', async: false })
export class IsPasswordMatchingConstraint implements ValidatorConstraintInterface {
	validate(password: string, args: ValidationArguments): boolean {
		const object = args.object as NewPasswordInput
		return object.password === object.confirmPassword
	}

	defaultMessage(args: ValidationArguments): string {
		return 'Password and confirm password do not match'
	}
}
