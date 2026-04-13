import { ValidationErrors, OnboardingFormData } from "./onboarding.types";
import { CLASS_OPTIONS, PROVINCE_OPTIONS } from "./onboarding.constants";

export const validateUsername = (username: string): string | null => {
    if (!username || username.trim().length === 0) {
        return "Tên người dùng không được để trống";
    }
    if (username.trim().length < 3) {
        return "Tên người dùng phải có ít nhất 3 ký tự";
    }
    if (username.trim().length > 20) {
        return "Tên người dùng không được quá 20 ký tự";
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
        return "Tên người dùng chỉ được chứa chữ cái, số, dấu gạch dưới và dấu chấm";
    }
    return null;
};

export const validateClass = (classValue: string): string | null => {
    if (!classValue) {
        return "Vui lòng chọn lớp";
    }
    // Type assertion an toàn: kiểm tra xem classValue có nằm trong CLASS_OPTIONS không
    const isValidClass = CLASS_OPTIONS.some((option) => option === classValue);
    if (!isValidClass) {
        return "Lớp không hợp lệ";
    }
    return null;
};

export const validateProvince = (province: string): string | null => {
    if (!province) {
        return "Vui lòng chọn tỉnh/thành phố";
    }
    // Type assertion an toàn: kiểm tra xem province có nằm trong PROVINCE_OPTIONS không
    const isValidProvince = PROVINCE_OPTIONS.some((option) => option === province);
    if (!isValidProvince) {
        return "Tỉnh/thành phố không hợp lệ";
    }
    return null;
};

export const validateSchool = (school: string): string | null => {
    if (!school || school.trim().length === 0) {
        return "Trường học không được để trống";
    }
    return null;
};

export const validateBirthday = (birthday: string): string | null => {
    if (!birthday) {
        return "Ngày sinh không được để trống";
    }
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(birthday)) {
        return "Ngày sinh không hợp lệ (YYYY-MM-DD)";
    }
    // Kiểm tra tuổi (không được quá 100 tuổi và không được là tương lai)
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 5) {
        return "Tuổi phải từ 5 trở lên";
    }
    if (age > 100) {
        return "Tuổi không hợp lệ";
    }
    return null;
};

export const validateBio = (bio: string): string | null => {
    if (bio && bio.length > 500) {
        return "Bio không được vượt quá 500 ký tự";
    }
    return null;
};

export const validateForm = (data: OnboardingFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    const usernameError = validateUsername(data.username);
    if (usernameError) errors.username = usernameError;

    const classError = validateClass(data.class);
    if (classError) errors.class = classError;

    const provinceError = validateProvince(data.province);
    if (provinceError) errors.province = provinceError;

    const schoolError = validateSchool(data.school);
    if (schoolError) errors.school = schoolError;

    const birthdayError = validateBirthday(data.birthday);
    if (birthdayError) errors.birthday = birthdayError;

    const bioError = validateBio(data.bio);
    if (bioError) errors.bio = bioError;

    return errors;
};