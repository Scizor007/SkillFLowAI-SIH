import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth/AuthContext';
import { useUser } from '@/context/UserContext';
import { Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const predefinedSkills = [
    'JavaScript', 'Python', 'Java', 'HTML/CSS', 'React',
    'Node.js', 'SQL', 'Data Science', 'Machine Learning',
    'Design', 'Marketing', 'Writing', 'Project Management'
];

const UserProfileForm = () => {
    const { user } = useAuth();
    const { updateUserProfile } = useUser();
    const [name, setName] = useState(user?.name || '');
    const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);
    const [dob, setDob] = useState('');
    const [age, setAge] = useState<number | ''>(''); // auto or manual
    const [gender, setGender] = useState('');
    const [currentLevel, setCurrentLevel] = useState('');
    const [stream, setStream] = useState('');
    const [interests, setInterests] = useState('');
    const [passion, setPassion] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCustomSkill, setShowCustomSkill] = useState(false);
    const [customSkill, setCustomSkill] = useState('');
    const navigate = useNavigate();

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        );
    };

    const addCustomSkill = () => {
        if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
            setSelectedSkills(prev => [...prev, customSkill.trim()]);
            setCustomSkill('');
            setShowCustomSkill(false);
        }
    };

    const calculateAge = (dobString: string) => {
        const birthDate = new Date(dobString);
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            years--;
        }
        return years;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !dob || !gender) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setIsSubmitting(true);

            const calculatedAge = calculateAge(dob);

            if (user?.id) {
                const { error: authError } = await supabase.auth.updateUser({
                    data: {
                        name,
                        skills: selectedSkills,
                        dob,
                        gender,
                        age: calculatedAge,
                        currentLevel,
                        stream,
                        interests,
                        passion,
                        location,
                        category,
                    }
                });

                if (authError) {
                    console.error('Auth error:', authError);
                    toast.error('Failed to update user metadata');
                    return;
                }

                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        full_name: name,
                        skills: selectedSkills,
                        dob,
                        gender,
                        age: calculatedAge,
                        current_level: currentLevel,
                        stream,
                        interests: interests.split(',').map(i => i.trim()),
                        passion,
                        location,
                        category,
                        updated_at: new Date().toISOString()
                    });

                if (profileError) {
                    console.error('Profile error:', profileError);
                    toast.error('Failed to update profile');
                    return;
                }
            }

            await updateUserProfile({
                name,
                skills: selectedSkills,
                dob,
                gender,
                age,
                currentLevel,
                stream,
                interests,
                passion,
                location,
                category,
            });

            toast.success('Profile updated successfully');
            navigate('/home');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            {/* Name */}
            <div className="space-y-4">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            {/* Date of Birth + Age */}
            <div className="space-y-4">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => {
                        setDob(e.target.value);
                        setAge(calculateAge(e.target.value));
                    }}
                    required
                />
                {age !== '' && <p className="text-sm text-gray-500">Age: {age}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-4">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Current Level */}
            <div className="space-y-4">
                <Label htmlFor="currentLevel">Current Level</Label>
                <Select value={currentLevel} onValueChange={setCurrentLevel}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="School">School</SelectItem>
                        <SelectItem value="UG">Undergraduate</SelectItem>
                        <SelectItem value="PG">Postgraduate</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stream */}
            <div className="space-y-4">
                <Label htmlFor="stream">Stream</Label>
                <Select value={stream} onValueChange={setStream}>
                    <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="MPC">MPC</SelectItem>
                        <SelectItem value="BiPC">BiPC</SelectItem>
                        <SelectItem value="Commerce">Commerce</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Interests */}
            <div className="space-y-4">
                <Label htmlFor="interests">Interests (comma separated)</Label>
                <Input id="interests" value={interests} onChange={(e) => setInterests(e.target.value)} />
            </div>

            {/* Passion */}
            <div className="space-y-4">
                <Label htmlFor="passion">Passion</Label>
                <Input id="passion" value={passion} onChange={(e) => setPassion(e.target.value)} />
            </div>

            {/* Location */}
            <div className="space-y-4">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            {/* Category */}
            <div className="space-y-4">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Skills */}
            <div className="space-y-4">
                <Label>Your Skills</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {predefinedSkills.map((skill) => (
                        <div key={skill} className="flex items-center space-x-2 p-3 border rounded-lg">
                            <Checkbox
                                id={`skill-${skill}`}
                                checked={selectedSkills.includes(skill)}
                                onCheckedChange={() => toggleSkill(skill)}
                            />
                            <Label htmlFor={`skill-${skill}`}>{skill}</Label>
                        </div>
                    ))}

                    {/* Custom skills */}
                    {selectedSkills.filter(s => !predefinedSkills.includes(s)).map((s) => (
                        <div key={s} className="flex items-center space-x-2 p-3 border rounded-lg border-primary">
                            <Checkbox
                                id={`skill-${s}`}
                                checked
                                onCheckedChange={() => toggleSkill(s)}
                            />
                            <Label htmlFor={`skill-${s}`}>{s}</Label>
                        </div>
                    ))}

                    {!showCustomSkill ? (
                        <Button type="button" variant="outline" onClick={() => setShowCustomSkill(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Add Other Skill
                        </Button>
                    ) : (
                        <div className="flex items-center p-3 border rounded-lg bg-muted">
                            <Input
                                value={customSkill}
                                onChange={(e) => setCustomSkill(e.target.value)}
                                placeholder="Type your skill"
                                className="mr-2"
                            />
                            <Button type="button" size="sm" onClick={addCustomSkill} disabled={!customSkill.trim()}>
                                Add
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full py-6 mt-8" disabled={isSubmitting}>
                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : 'Continue'}
            </Button>
        </form>
    );
};

export default UserProfileForm;
