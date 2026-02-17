"use client"

import Button from '@/components/ui/button'
import ButtonIcon from '@/components/ui/button-icon'
import InputPassword from '@/components/ui/input-password'
import InputText from '@/components/ui/input-text'
import Image from 'next/image'

export default function Login() {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen bg-black">
            <Image src="/logo.png" alt="Logo" width={150} height={100} className="mb-4" />

            <h1 className="text-white font-bold text-[20px] md:text-[25px] lg:text-[30px] text-center">
                Chào mừng bạn đã quay trở lại
            </h1>

            <p className="mt-[5px] text-white/70 text-center">
                Hãy tiếp tục tiến trình học tập nào!
            </p>

            <div className="flex flex-col items-center w-full max-w-sm px-4">
                <div className="w-full mt-6 space-y-4">
                    <InputText placeholder="Tên đăng nhập" />
                    <InputPassword placeholder="Mật khẩu" />
                    <Button>Đăng nhập</Button>

                    <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-[1px] bg-white/20" />
                        <span className="text-white/60 text-sm font-semibold">HOẶC</span>
                        <div className="flex-1 h-[1px] bg-white/20" />
                    </div>

                    <ButtonIcon>
                        <svg width="25" height="25" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg">
                            <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" />
                            <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" />
                            <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" />
                            <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" />
                        </svg>
                        Đăng nhập với Google
                    </ButtonIcon>

                    <ButtonIcon>
                        <svg
                            version="1.1"
                            id="svg9"
                            width="25"
                            height="25"
                            viewBox="0 0 666.66668 666.66717"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <defs id="defs13">
                                <clipPath clipPathUnits="userSpaceOnUse" id="clipPath25">
                                    <path d="M 0,700 H 700 V 0 H 0 Z" id="path23" />
                                </clipPath>
                            </defs>

                            <g
                                id="g17"
                                transform="matrix(1.3333333,0,0,-1.3333333,-133.33333,799.99999)"
                            >
                                <g id="g19">
                                    <g id="g21" clipPath="url(#clipPath25)">
                                        <g id="g27" transform="translate(600,350)">
                                            <path
                                                d="m 0,0 c 0,138.071 -111.929,250 -250,250 -138.071,0 -250,-111.929 -250,-250 0,-117.245 80.715,-215.622 189.606,-242.638 v 166.242 h -51.552 V 0 h 51.552 v 32.919 c 0,85.092 38.508,124.532 122.048,124.532 15.838,0 43.167,-3.105 54.347,-6.211 V 81.986 c -5.901,0.621 -16.149,0.932 -28.882,0.932 -40.993,0 -56.832,-15.528 -56.832,-55.9 V 0 h 81.659 l -14.028,-76.396 h -67.631 V -248.169 C -95.927,-233.218 0,-127.818 0,0"
                                                fill="#0866ff"
                                            />
                                        </g>

                                        <g id="g31" transform="translate(447.9175,273.6036)">
                                            <path
                                                d="M 0,0 14.029,76.396 H -67.63 v 27.019 c 0,40.372 15.838,55.899 56.831,55.899 12.733,0 22.981,-0.31 28.882,-0.931 v 69.253 c -11.18,3.106 -38.509,6.212 -54.347,6.212 -83.539,0 -122.048,-39.441 -122.048,-124.533 V 76.396 h -51.552 V 0 h 51.552 v -166.242 c 19.343,-4.798 39.568,-7.362 60.394,-7.362 10.254,0 20.358,0.632 30.288,1.831 L -67.63,0 Z"
                                                fill="#ffffff"
                                            />
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                        Đăng nhập với Facebook
                    </ButtonIcon>
                </div>
            </div>
        </div>
    )
}