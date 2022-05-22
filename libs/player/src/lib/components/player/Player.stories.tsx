import { Story, Meta } from "@storybook/react";
import { Player, PlayerProps } from ".";

export default {
	component: Player,
	title: "Player",
} as Meta;

const Template: Story<PlayerProps> = args => <Player {...args} />;

export const Primary = Template.bind({});
Primary.args = {
	src: "/video.mp4",
	track: "/subtitles.vtt",
};
